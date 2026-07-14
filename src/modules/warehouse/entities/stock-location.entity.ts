import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockWarehouse } from './stock-warehouse.entity';

export enum StockLocationUsage {
  INTERNAL = 'internal',
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  INVENTORY = 'inventory',
  VIEW = 'view',
}

/** stock_location (+ext agd_wms_location_zone/slot vía zoneCode/slotCode). */
@Entity('stock_location')
export class StockLocation extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => StockWarehouse, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: StockWarehouse | null;

  @Column({ name: 'warehouse_id', type: 'int', nullable: true })
  warehouseId: number | null;

  @ManyToOne(() => StockLocation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: StockLocation | null;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({
    type: 'enum',
    enum: StockLocationUsage,
    default: StockLocationUsage.INTERNAL,
  })
  usage: StockLocationUsage;

  @Column({ name: 'zone_code', type: 'varchar', length: 32, nullable: true })
  zoneCode: string | null;

  @Column({ name: 'slot_code', type: 'varchar', length: 32, nullable: true })
  slotCode: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
