import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('agd_governance_workflow')
export class GovernanceWorkflow extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'approver_group_id', type: 'int' })
  approverGroupId: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
