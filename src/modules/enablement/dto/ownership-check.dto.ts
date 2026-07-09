import { IsString } from 'class-validator';

/** Verificación ligera de titularidad para endpoints públicos de seguimiento
 * (el solicitante aún no tiene sesión antes del paso 6 de habilitación). */
export class OwnershipCheckDto {
  @IsString()
  rif: string;
}
