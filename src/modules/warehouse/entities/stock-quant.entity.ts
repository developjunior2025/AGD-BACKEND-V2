import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';
import { StockLocation } from './stock-location.entity';
import { StockLot } from './stock-lot.entity';
import { StockQuantPackage } from './stock-quant-package.entity';

/**
 * stock_quant (+ext agd_wms_inventory_unit, agd_wms_inventory_balance) —
 * saldo de inventario por producto/ubicación/lote/bulto. `caseId` es la
 * extensión propia: a qué expediente pertenece la mercancía depositada.
 */
@Entity('stock_quant')
@Index(['caseId'])
export class StockQuant extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @ManyToOne(() => StockLocation, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location: StockLocation;

  @Column({ name: 'location_id' })
  locationId: number;

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
  quantPackage: StockQuantPackage | null;

  @Column({ name: 'package_id', type: 'int', nullable: true })
  packageId: number | null;

  @Column({ name: 'case_id', type: 'int', nullable: true })
  caseId: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: string;
}
