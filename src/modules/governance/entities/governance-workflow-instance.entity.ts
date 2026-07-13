import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GovernanceWorkflow } from './governance-workflow.entity';

export enum WorkflowInstanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** agd_governance_workflow_instance — ejecución de un workflow sobre un registro concreto. */
@Entity('agd_governance_workflow_instance')
@Index(['resModel', 'resId'])
export class GovernanceWorkflowInstance extends BaseEntity {
  @ManyToOne(() => GovernanceWorkflow, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'governance_workflow_id' })
  governanceWorkflow: GovernanceWorkflow;

  @Column({ name: 'governance_workflow_id' })
  governanceWorkflowId: number;

  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @Column({
    type: 'enum',
    enum: WorkflowInstanceStatus,
    default: WorkflowInstanceStatus.PENDING,
  })
  status: WorkflowInstanceStatus;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'decided_by_id', type: 'int', nullable: true })
  decidedById: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
