import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

/**
 * agd_case — expediente, hub central referenciado por comercial, aduanas,
 * WMS y TOS en fases posteriores.
 */
@Entity('agd_case')
export class Case extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code: string;

  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_partner_id' })
  ownerPartner: Partner;

  @Column({ name: 'owner_partner_id' })
  ownerPartnerId: number;

  @ManyToOne(() => Group, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'profile_group_id' })
  profileGroup: Group;

  @Column({ name: 'profile_group_id' })
  profileGroupId: number;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.OPEN })
  status: CaseStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'opened_at', type: 'timestamp' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date | null;
}
