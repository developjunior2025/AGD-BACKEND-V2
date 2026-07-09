import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../../../config/configuration';
import { RequestUser } from '../../identity/interfaces/request-user.interface';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const authConfig = configService.getOrThrow<AuthConfig>('auth');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.accessSecret,
    });
  }

  validate(payload: AccessTokenPayload): RequestUser {
    return {
      id: payload.sub,
      partnerId: payload.partnerId,
      login: payload.login,
      groupCodes: payload.groups,
      mustChangePassword: payload.mustChangePassword,
    };
  }
}
