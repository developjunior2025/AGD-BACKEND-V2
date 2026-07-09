import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Perfiles autenticados del ecosistema (res_groups + ext. agd_profile_type).
 * El perfil "Visitante" del mapa del sitio no tiene fila aquí: es acceso
 * público no autenticado, gobernado por @Public() en las rutas, no por RBAC.
 * Los 5 perfiles restantes + 'admin' (staff interno que procesa
 * habilitaciones y gobernanza) son filas semilla de esta tabla, no un enum
 * cerrado en código, para poder administrar permisos sin desplegar.
 */
export enum GroupCode {
  CONSULTOR = 'consultor',
  IMPORTADOR_EXPORTADOR = 'importador_exportador',
  AGENTE_ADUANAS = 'agente_aduanas',
  OPERADOR_AGD = 'operador_agd',
  AGENTE_TOS = 'agente_tos',
  ADMIN = 'admin',
}

@Entity('res_groups')
export class Group extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: GroupCode | string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_enablement_profile', type: 'boolean', default: true })
  isEnablementProfile: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
