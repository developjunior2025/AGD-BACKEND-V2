import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** agd_wms_weighing_ticket — boleta de pesaje de la mercancía de un expediente. */
@Entity('agd_wms_weighing_ticket')
export class WeighingTicket extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'stock_picking_id', type: 'int', nullable: true })
  stockPickingId: number | null;

  @Column({ name: 'gross_weight', type: 'decimal', precision: 12, scale: 2 })
  grossWeight: string;

  @Column({
    name: 'tare_weight',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  tareWeight: string | null;

  @Column({ name: 'net_weight', type: 'decimal', precision: 12, scale: 2 })
  netWeight: string;

  @Column({ name: 'weighed_at', type: 'timestamp' })
  weighedAt: Date;
}
