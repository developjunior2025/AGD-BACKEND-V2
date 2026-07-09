import { SetMetadata } from '@nestjs/common';

export const ALLOW_PASSWORD_CHANGE_REQUIRED_KEY = 'allowPasswordChangeRequired';

/**
 * Permite acceder a la ruta aunque el usuario tenga must_change_password=true
 * (p.ej. el propio endpoint de cambio de contraseña, o logout).
 */
export const AllowPasswordChangeRequired = () =>
  SetMetadata(ALLOW_PASSWORD_CHANGE_REQUIRED_KEY, true);
