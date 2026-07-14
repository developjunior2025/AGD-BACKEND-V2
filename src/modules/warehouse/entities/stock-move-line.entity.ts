import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockLocation } from './stock-location.entity';
import { StockLot } from './stock-lot.entity';
import { StockMove } from './stock-move.entity';
import { StockQuantPackage } from './stock-quant-package.entity';

/** stock_move_line (+ext agd_wms_receipt_line) — línea concreta de un movimiento (con lote/bulto). */
@Entity('stock_move_line')
export class StockMoveLine extends BaseEntity {
  @ManyToOne(() => StockMove, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'move_id' })
  move: StockMove;

  @Column({ name: 'move_id' })
  moveId: number;

  @ManyToOne(() => StockLot, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'lot_id' })
  lot: StockLot | null;

  @Column({ name: 'lot_id', type: 'int', nullable: true })
  lotId: number | null;

  @ManyToOne(() => StockQuantPackage, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'package_id' })
  resultPackage: StockQuantPackage | null;

  @Column({ name: 'package_id', type: 'int', nullable: true })
  packageId: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: string;

  @ManyToOne(() => StockLocation, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location: StockLocation;

  @Column({ name: 'location_id' })
  locationId: number;
}
