import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ActivityType {
  APPROVAL = 'approval',
  TASK = 'task',
  REMINDER = 'reminder',
}

export enum ActivityStatus {
  PENDING = 'pending',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum ActivityDecision {
  APPROVE = 'approve',
  REJECT = 'reject',
}

/**
 * mail_activity (+ext agd_governance_approval vía activityType='approval').
 * Tarea/recordatorio/aprobación genérica ligada polimórficamente a
 * cualquier modelo (resModel, resId).
 */
@Entity('mail_activity')
@Index(['resModel', 'resId'])
export class Activity extends BaseEntity {
  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @Column({ name: 'activity_type', type: 'enum', enum: ActivityType })
  activityType: ActivityType;

  @Column({ type: 'varchar', length: 255 })
  summary: string;

  @Column({ name: 'assigned_to_group_id', type: 'int', nullable: true })
  assignedToGroupId: number | null;

  @Column({ name: 'assigned_to_user_id', type: 'int', nullable: true })
  assignedToUserId: number | null;

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date | null;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.PENDING,
  })
  status: ActivityStatus;

  @Column({ name: 'done_at', type: 'timestamp', nullable: true })
  doneAt: Date | null;

  @Column({ name: 'done_by_id', type: 'int', nullable: true })
  doneById: number | null;

  @Column({ type: 'enum', enum: ActivityDecision, nullable: true })
  decision: ActivityDecision | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
