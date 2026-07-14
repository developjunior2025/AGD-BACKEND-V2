import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ConsolidationOrderStatus } from './consolidation-order.entity';

/** agd_wms_deconsolidation_order — orden de desconsolidación de carga de un expediente. */
@Entity('agd_wms_deconsolidation_order')
export class DeconsolidationOrder extends BaseEntity {
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
