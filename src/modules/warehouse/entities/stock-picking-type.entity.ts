import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockWarehouse } from './stock-warehouse.entity';

export enum StockPickingTypeCode {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  INTERNAL = 'internal',
}

@Entity('stock_picking_type')
export class StockPickingType extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'enum', enum: StockPickingTypeCode })
  code: StockPickingTypeCode;

  @ManyToOne(() => StockWarehouse, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: StockWarehouse;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;
}
