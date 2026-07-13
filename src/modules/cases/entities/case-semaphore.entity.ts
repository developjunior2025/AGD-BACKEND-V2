import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Case } from './case.entity';

export enum SemaphoreColor {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
}

/** agd_case_semaphore — semáforo de estado/plazos del expediente. */
@Entity('agd_case_semaphore')
export class CaseSemaphore extends BaseEntity {
  @OneToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Index({ unique: true })
  @Column({ name: 'case_id' })
  caseId: number;

  @Column({ type: 'enum', enum: SemaphoreColor, default: SemaphoreColor.GREEN })
  color: SemaphoreColor;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date | null;
}
