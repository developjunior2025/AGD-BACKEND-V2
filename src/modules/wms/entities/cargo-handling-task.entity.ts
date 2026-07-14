import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CargoHandlingTaskType {
  LOADING = 'loading',
  UNLOADING = 'unloading',
  RELOCATION = 'relocation',
  OTHER = 'other',
}

export enum CargoHandlingTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

/** agd_wms_cargo_handling_task — tarea de manipulación de carga de un expediente. */
@Entity('agd_wms_cargo_handling_task')
export class CargoHandlingTask extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'task_type', type: 'enum', enum: CargoHandlingTaskType })
  taskType: CargoHandlingTaskType;

  @Column({ name: 'assigned_to_user_id', type: 'int', nullable: true })
  assignedToUserId: number | null;

  @Column({
    type: 'enum',
    enum: CargoHandlingTaskStatus,
    default: CargoHandlingTaskStatus.PENDING,
  })
  status: CargoHandlingTaskStatus;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
