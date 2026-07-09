import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../../identity/access-control.service';
import { RequestUser } from '../../identity/interfaces/request-user.interface';
import {
  REQUIRE_PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/require-permission.decorator';

/**
 * Enforcement real de ir_model_access: la ruta declara @RequirePermission(model, action)
 * y este guard consulta los grupos del usuario contra la tabla de permisos.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControlService: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();

    return this.accessControlService.hasPermission(
      user,
      required.modelName,
      required.action,
    );
  }
}
