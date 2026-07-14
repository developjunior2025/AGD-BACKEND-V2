import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';
import { StockLocation } from './stock-location.entity';
import { StockPicking } from './stock-picking.entity';

export enum StockMoveState {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

@Entity('stock_move')
export class StockMove extends BaseEntity {
  @ManyToOne(() => StockPicking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'picking_id' })
  picking: StockPicking;

  @Column({ name: 'picking_id' })
  pickingId: number;

  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: string;

  @ManyToOne(() => StockLocation, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'source_location_id' })
  sourceLocation: StockLocation;

  @Column({ name: 'source_location_id' })
  sourceLocationId: number;

  @ManyToOne(() => StockLocation, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'dest_location_id' })
  destLocation: StockLocation;

  @Column({ name: 'dest_location_id' })
  destLocationId: number;

  @Column({ type: 'enum', enum: StockMoveState, default: StockMoveState.DRAFT })
  state: StockMoveState;
}
