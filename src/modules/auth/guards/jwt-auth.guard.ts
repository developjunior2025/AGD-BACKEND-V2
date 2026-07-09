import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_PASSWORD_CHANGE_REQUIRED_KEY } from '../decorators/allow-password-change-required.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestUser } from '../../identity/interfaces/request-user.interface';

/**
 * Guard global. Deja pasar rutas @Public() sin token (perfil Visitante).
 * Para el resto, valida el JWT y además bloquea el acceso si el usuario
 * tiene must_change_password=true, salvo que la ruta esté marcada con
 * @AllowPasswordChangeRequired() (cambio de contraseña, logout).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser = RequestUser>(
    err: unknown,
    user: RequestUser | false,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const result = super.handleRequest<RequestUser>(err, user, info, context);

    const allowWhilePasswordChangeRequired =
      this.reflector.getAllAndOverride<boolean>(
        ALLOW_PASSWORD_CHANGE_REQUIRED_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (result.mustChangePassword && !allowWhilePasswordChangeRequired) {
      throw new ForbiddenException(
        'Debe cambiar su contraseña inicial antes de continuar',
      );
    }

    return result as TUser;
  }
}
