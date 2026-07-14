import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockPickingType } from './stock-picking-type.entity';

export enum StockPickingState {
  DRAFT = 'draft',
  WAITING = 'waiting',
  ASSIGNED = 'assigned',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

/**
 * stock_picking (+ext agd_wms_receipt_notice, agd_wms_receipt,
 * agd_wms_inbound_order, agd_transport_delivery). `manifestNumber`/`blNumber`
 * son la referencia contra la que se recibe (espejo SIDUNEA MODCAR).
 */
@Entity('stock_picking')
@Index(['caseId'])
export class StockPicking extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  reference: string;

  @ManyToOne(() => StockPickingType, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'picking_type_id' })
  pickingType: StockPickingType;

  @Column({ name: 'picking_type_id' })
  pickingTypeId: number;

  @Column({ name: 'case_id', type: 'int', nullable: true })
  caseId: number | null;

  @Column({
    name: 'manifest_number',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  manifestNumber: string | null;

  @Column({ name: 'bl_number', type: 'varchar', length: 64, nullable: true })
  blNumber: string | null;

  @Column({
    type: 'enum',
    enum: StockPickingState,
    default: StockPickingState.DRAFT,
  })
  state: StockPickingState;

  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: true })
  scheduledDate: Date | null;

  @Column({ name: 'done_at', type: 'timestamp', nullable: true })
  doneAt: Date | null;
}
