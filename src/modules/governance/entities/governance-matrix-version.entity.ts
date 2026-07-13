import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GovernanceMatrix } from './governance-matrix.entity';

export enum GovernanceMatrixVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('agd_governance_matrix_version')
@Index(['governanceMatrixId', 'versionNumber'], { unique: true })
export class GovernanceMatrixVersion extends BaseEntity {
  @ManyToOne(() => GovernanceMatrix, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'governance_matrix_id' })
  governanceMatrix: GovernanceMatrix;

  @Column({ name: 'governance_matrix_id' })
  governanceMatrixId: number;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({
    type: 'enum',
    enum: GovernanceMatrixVersionStatus,
    default: GovernanceMatrixVersionStatus.DRAFT,
  })
  status: GovernanceMatrixVersionStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'published_by_id', type: 'int', nullable: true })
  publishedById: number | null;
}
