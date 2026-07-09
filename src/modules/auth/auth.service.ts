import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AuthConfig } from '../../config/configuration';
import {
  generateTempPassword,
  hashSecret,
  verifySecret,
} from '../../common/utils/password.util';
import { Message, MessageType } from '../identity/entities/message.entity';
import { ModelName } from '../../common/constants/model-names';
import { UserGroup } from '../identity/entities/user-group.entity';
import { User } from '../identity/entities/user.entity';
import { RequestUser } from '../identity/interfaces/request-user.interface';
import { AuthSession } from './entities/auth-session.entity';
import { AccessTokenPayload } from './interfaces/jwt-payload.interface';

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TOKEN_BYTES = 32;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authConfig: AuthConfig;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.authConfig = this.configService.getOrThrow<AuthConfig>('auth');
  }

  async login(
    login: string,
    password: string,
    meta: RequestMeta,
  ): Promise<TokenPair & { user: RequestUser }> {
    const user = await this.userRepository.findOne({ where: { login } });

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException(
        'Cuenta bloqueada temporalmente por intentos fallidos',
      );
    }

    const passwordMatches = await verifySecret(password, user.passwordHash);
    if (!passwordMatches) {
      await this.registerFailedLogin(user, meta);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    await this.audit(user.id, MessageType.AUDIT, 'Inicio de sesión', meta);

    const requestUser = await this.toRequestUser(user);
    const tokens = await this.issueTokenPair(requestUser, meta);
    return { ...tokens, user: requestUser };
  }

  async refresh(refreshToken: string, meta: RequestMeta): Promise<TokenPair> {
    const { id: sessionId, secret } = this.parseCompositeToken(refreshToken);

    const session = await this.authSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const secretMatches = await verifySecret(secret, session.secretHash);
    if (!secretMatches) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    session.revokedAt = new Date();
    await this.authSessionRepository.save(session);

    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });
    if (!user || !user.active) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const requestUser = await this.toRequestUser(user);
    return this.issueTokenPair(requestUser, meta);
  }

  async logout(refreshToken: string): Promise<void> {
    const { id: sessionId } = this.parseCompositeToken(refreshToken);
    await this.authSessionRepository.update(
      { id: sessionId },
      { revokedAt: new Date() },
    );
  }

  async listActiveSessions(userId: number): Promise<AuthSession[]> {
    return this.authSessionRepository.find({
      where: { userId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeSession(userId: number, sessionId: number): Promise<void> {
    const session = await this.authSessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) throw new UnauthorizedException('Sesión no encontrada');
    session.revokedAt = new Date();
    await this.authSessionRepository.save(session);
  }

  async recoverPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { login: email },
    });
    // Respuesta uniforme exista o no el usuario, para no filtrar cuentas registradas.
    if (!user) return;

    const secret = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    user.passwordResetTokenHash = await hashSecret(secret);
    user.passwordResetExpiresAt = new Date(
      Date.now() + this.authConfig.passwordResetTokenMinutes * 60_000,
    );
    await this.userRepository.save(user);

    const resetToken = `${user.id}.${secret}`;
    // Envío de correo real pendiente de un proveedor externo (fuera de alcance
    // standalone de esta fase); se deja el token en log para flujo manual/dev.
    this.logger.log(`Password reset token for user ${user.id}: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { id: userId, secret } = this.parseCompositeToken(token);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'Token de recuperación inválido o expirado',
      );
    }

    const matches = await verifySecret(secret, user.passwordResetTokenHash);
    if (!matches) {
      throw new UnauthorizedException(
        'Token de recuperación inválido o expirado',
      );
    }

    user.passwordHash = await hashSecret(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
    await this.audit(
      user.id,
      MessageType.AUDIT,
      'Contraseña restablecida vía recuperación',
      { ipAddress: null, userAgent: null },
    );
  }

  async changePassword(
    requestUser: RequestUser,
    currentPassword: string,
    newPassword: string,
    meta: RequestMeta,
  ): Promise<TokenPair> {
    const user = await this.userRepository.findOne({
      where: { id: requestUser.id },
    });
    if (!user) throw new UnauthorizedException();

    // Si es el cambio obligatorio inicial (contraseña temporal), igual se
    // exige conocer la contraseña actual para evitar apropiación de cuenta.
    const currentMatches = await verifySecret(
      currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) {
      throw new UnauthorizedException('La contraseña actual no coincide');
    }

    user.passwordHash = await hashSecret(newPassword);
    user.mustChangePassword = false;
    await this.userRepository.save(user);
    await this.audit(user.id, MessageType.AUDIT, 'Contraseña cambiada', {
      ipAddress: null,
      userAgent: null,
    });

    // El access token vigente lleva must_change_password=true en sus claims;
    // se reemite el par de tokens para que el cliente deje de estar bloqueado
    // sin tener que golpear /auth/login de nuevo.
    const refreshed = await this.toRequestUser(user);
    return this.issueTokenPair(refreshed, meta);
  }

  /** Usado por el módulo de habilitación al crear la cuenta (paso 6). */
  async createUserWithTempPassword(
    partnerId: number,
    login: string,
  ): Promise<{ user: User; tempPassword: string }> {
    const tempPassword = generateTempPassword();
    const user = this.userRepository.create({
      partnerId,
      login,
      passwordHash: await hashSecret(tempPassword),
      mustChangePassword: true,
      active: false,
    });
    const saved = await this.userRepository.save(user);
    return { user: saved, tempPassword };
  }

  private async registerFailedLogin(
    user: User,
    meta: RequestMeta,
  ): Promise<void> {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= this.authConfig.failedLoginLockThreshold) {
      user.lockedUntil = new Date(
        Date.now() + this.authConfig.accountLockMinutes * 60_000,
      );
    }
    await this.userRepository.save(user);
    await this.audit(
      user.id,
      MessageType.AUDIT,
      `Intento de inicio de sesión fallido (${user.failedLoginAttempts})`,
      meta,
    );
  }

  private async issueTokenPair(
    user: RequestUser,
    meta: RequestMeta,
  ): Promise<TokenPair> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      partnerId: user.partnerId,
      login: user.login,
      groups: user.groupCodes,
      mustChangePassword: user.mustChangePassword,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.authConfig.accessSecret,
      // @nestjs/jwt tipa expiresIn como plantilla literal (p.ej. '15m');
      // el valor viene de env como string genérico validado por Joi.
      expiresIn: this.authConfig.accessExpiresIn as never,
    });

    const refreshToken = await this.issueRefreshToken(user.id, meta);
    return { accessToken, refreshToken };
  }

  private async issueRefreshToken(
    userId: number,
    meta: RequestMeta,
  ): Promise<string> {
    const secret = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const session = this.authSessionRepository.create({
      userId,
      secretHash: await hashSecret(secret),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: this.computeRefreshExpiry(),
    });
    const saved = await this.authSessionRepository.save(session);
    return `${saved.id}.${secret}`;
  }

  private computeRefreshExpiry(): Date {
    const match = /^(\d+)([smhd])$/.exec(this.authConfig.refreshExpiresIn);
    const unitMs: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    if (!match) return new Date(Date.now() + 7 * unitMs.d);
    const [, amount, unit] = match;
    return new Date(Date.now() + Number(amount) * unitMs[unit]);
  }

  /** Los tokens opacos (refresh / reset de contraseña) usan el mismo formato "id.secret". */
  private parseCompositeToken(token: string): { id: number; secret: string } {
    const [rawId, secret] = token.split('.');
    const id = Number(rawId);
    if (!rawId || !secret || Number.isNaN(id)) {
      throw new UnauthorizedException('Token inválido');
    }
    return { id, secret };
  }

  private async toRequestUser(user: User): Promise<RequestUser> {
    const groupCodes = await this.loadGroupCodes(user.id);
    return {
      id: user.id,
      partnerId: user.partnerId,
      login: user.login,
      groupCodes,
      mustChangePassword: user.mustChangePassword,
    };
  }

  private async loadGroupCodes(userId: number): Promise<string[]> {
    const relations = await this.userGroupRepository.find({
      where: { userId },
      relations: { group: true },
    });
    return relations.map((relation) => relation.group.code);
  }

  private async audit(
    userId: number,
    messageType: MessageType,
    body: string,
    meta: RequestMeta,
  ): Promise<void> {
    await this.messageRepository.insert({
      resModel: ModelName.USER,
      resId: userId,
      messageType,
      body,
      authorId: userId,
      ipAddress: meta.ipAddress,
    });
  }
}
