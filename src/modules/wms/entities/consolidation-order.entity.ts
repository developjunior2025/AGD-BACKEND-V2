import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConsolidationOrderStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

/** agd_wms_consolidation_order — orden de consolidación de carga de un expediente. */
@Entity('agd_wms_consolidation_order')
export class ConsolidationOrder extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({
    type: 'enum',
    enum: ConsolidationOrderStatus,
    default: ConsolidationOrderStatus.DRAFT,
  })
  status: ConsolidationOrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
