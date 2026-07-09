import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum EnablementRequestStatus {
  IN_REVIEW = 'in_review',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

/** agd_user_enablement_request — cabecera del proceso de 9 pasos. */
@Entity('agd_user_enablement_request')
export class EnablementRequest extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @ManyToOne(() => Group, { eager: true })
  @JoinColumn({ name: 'requested_group_id' })
  requestedGroup: Group;

  @Column({ name: 'requested_group_id' })
  requestedGroupId: number;

  @Column({
    type: 'enum',
    enum: EnablementRequestStatus,
    default: EnablementRequestStatus.IN_REVIEW,
  })
  status: EnablementRequestStatus;

  @Column({ name: 'current_step', type: 'int', default: 1 })
  currentStep: number;

  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'submitted_at', type: 'timestamp' })
  submittedAt: Date;

  @Column({ name: 'decided_at', type: 'timestamp', nullable: true })
  decidedAt: Date | null;

  @Column({ name: 'decided_by_id', type: 'int', nullable: true })
  decidedById: number | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'rejected_at_step', type: 'int', nullable: true })
  rejectedAtStep: number | null;
}
