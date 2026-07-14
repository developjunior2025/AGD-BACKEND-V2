import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum CustomsLicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/** agd_customs_license — habilitación profesional del agente de aduanas, verificada por un administrador. */
@Entity('agd_customs_license')
export class CustomsLicense extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Index({ unique: true })
  @Column({ name: 'partner_id' })
  partnerId: number;

  @Column({ name: 'license_number', type: 'varchar', length: 64 })
  licenseNumber: string;

  @Column({ name: 'issued_at', type: 'date' })
  issuedAt: string;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: string | null;

  @Column({
    type: 'enum',
    enum: CustomsLicenseStatus,
    default: CustomsLicenseStatus.ACTIVE,
  })
  status: CustomsLicenseStatus;
}
