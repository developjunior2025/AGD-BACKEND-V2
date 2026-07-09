import { SetMetadata } from '@nestjs/common';
import { GroupCode } from '../../identity/entities/group.entity';

export const ROLES_KEY = 'roles';

/** Restringe la ruta a usuarios que tengan al menos uno de estos perfiles. */
export const Roles = (...roles: GroupCode[]) => SetMetadata(ROLES_KEY, roles);
