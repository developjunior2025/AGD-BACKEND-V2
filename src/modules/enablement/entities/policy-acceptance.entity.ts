import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PolicyCode {
  TERMS = 'terms',
  PRIVACY = 'privacy',
  SECURITY = 'security',
}

/**
 * agd_policy_acceptance — se referencia por partner_id (no user_id) porque
 * la aceptación puede ocurrir en el registro público, antes de que exista
 * la cuenta (res_users), que solo se crea en el paso 6 de habilitación.
 */
@Entity('agd_policy_acceptance')
@Index(['partnerId', 'policyCode', 'policyVersion'], { unique: true })
export class PolicyAcceptance extends BaseEntity {
  @Column({ name: 'partner_id', type: 'int' })
  partnerId: number;

  @Column({ name: 'policy_code', type: 'enum', enum: PolicyCode })
  policyCode: PolicyCode;

  @Column({ name: 'policy_version', type: 'varchar', length: 32 })
  policyVersion: string;

  @Column({ name: 'accepted_at', type: 'timestamp' })
  acceptedAt: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;
}
