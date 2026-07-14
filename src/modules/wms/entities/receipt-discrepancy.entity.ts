import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockPicking } from '../../warehouse/entities/stock-picking.entity';

export enum ReceiptDiscrepancyType {
  SHORTAGE = 'shortage',
  EXCESS = 'excess',
  DAMAGE = 'damage',
  OTHER = 'other',
}

/** agd_wms_receipt_discrepancy — diferencia detectada al recibir contra el manifiesto. */
@Entity('agd_wms_receipt_discrepancy')
export class ReceiptDiscrepancy extends BaseEntity {
  @ManyToOne(() => StockPicking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_picking_id' })
  stockPicking: StockPicking;

  @Column({ name: 'stock_picking_id' })
  stockPickingId: number;

  @Column({
    name: 'discrepancy_type',
    type: 'enum',
    enum: ReceiptDiscrepancyType,
  })
  discrepancyType: ReceiptDiscrepancyType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  quantity: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;
}
