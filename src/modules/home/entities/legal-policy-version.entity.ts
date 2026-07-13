import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LegalPolicy } from './legal-policy.entity';

export enum LegalPolicyVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('agd_legal_policy_version')
@Index(['legalPolicyId', 'versionLabel'], { unique: true })
export class LegalPolicyVersion extends BaseEntity {
  @ManyToOne(() => LegalPolicy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'legal_policy_id' })
  legalPolicy: LegalPolicy;

  @Column({ name: 'legal_policy_id' })
  legalPolicyId: number;

  @Column({ name: 'version_label', type: 'varchar', length: 32 })
  versionLabel: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: LegalPolicyVersionStatus,
    default: LegalPolicyVersionStatus.DRAFT,
  })
  status: LegalPolicyVersionStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
