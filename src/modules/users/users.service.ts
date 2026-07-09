import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelName } from '../../common/constants/model-names';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Message, MessageType } from '../identity/entities/message.entity';
import { UserGroup } from '../identity/entities/user-group.entity';
import { User } from '../identity/entities/user.entity';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.findUserOrFail(userId);
    const groups = await this.userGroupRepository.find({
      where: { userId },
      relations: { group: true },
    });

    return {
      id: user.id,
      login: user.login,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
      partner: {
        id: user.partner.id,
        kind: user.partner.kind,
        displayName: user.partner.displayName,
        rif: user.partner.rif,
        email: user.partner.email,
      },
      groups: groups.map((relation) => relation.group.code),
    };
  }

  async listUsers(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    const [data, total] = await this.userRepository.findAndCount({
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async block(userId: number): Promise<void> {
    const user = await this.findUserOrFail(userId);
    user.active = false;
    await this.userRepository.save(user);
    await this.audit(userId, 'Cuenta bloqueada por un administrador');
  }

  async unblock(userId: number): Promise<void> {
    const user = await this.findUserOrFail(userId);
    user.active = true;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepository.save(user);
    await this.audit(userId, 'Cuenta desbloqueada por un administrador');
  }

  async loginHistory(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Message>> {
    await this.findUserOrFail(userId);
    const [data, total] = await this.messageRepository.findAndCount({
      where: {
        resModel: ModelName.USER,
        resId: userId,
        messageType: MessageType.AUDIT,
      },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  private async findUserOrFail(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private async audit(userId: number, body: string): Promise<void> {
    await this.messageRepository.insert({
      resModel: ModelName.USER,
      resId: userId,
      messageType: MessageType.AUDIT,
      body,
      authorId: null,
      ipAddress: null,
    });
  }
}
