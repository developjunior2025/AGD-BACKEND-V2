import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../../identity/access-control.service';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

export interface RequiredPermission {
  modelName: string;
  action: PermissionAction;
}

/** Exige permiso ir_model_access(grupo, modelo, acción) sobre alguno de los grupos del usuario. */
export const RequirePermission = (
  modelName: string,
  action: PermissionAction,
) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, {
    modelName,
    action,
  } satisfies RequiredPermission);
