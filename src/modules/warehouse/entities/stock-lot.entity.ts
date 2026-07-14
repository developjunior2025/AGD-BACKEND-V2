import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';

/** stock_lot (+ext agd_wms_inventory_unit) — unidad/bulto identificable de un producto. */
@Entity('stock_lot')
export class StockLot extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  name: string;

  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;
}
