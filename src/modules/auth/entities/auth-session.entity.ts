import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Sesión de refresh token (infraestructura de autenticación stateless con
 * revocación). No forma parte del modelo de negocio de 142 tablas: es el
 * soporte técnico de "gestión de sesiones activas" e "historial de accesos"
 * descritos en la infografía de Acceso al sistema.
 */
@Entity('agd_auth_session')
export class AuthSession extends BaseEntity {
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'secret_hash', type: 'varchar', length: 255 })
  secretHash: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;
}
