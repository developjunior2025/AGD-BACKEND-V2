import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductPricelist } from './product-pricelist.entity';
import { ProductTemplate } from './product-template.entity';

@Entity('product_pricelist_item')
@Index(['pricelistId', 'productTemplateId'], { unique: true })
export class ProductPricelistItem extends BaseEntity {
  @ManyToOne(() => ProductPricelist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pricelist_id' })
  pricelist: ProductPricelist;

  @Column({ name: 'pricelist_id' })
  pricelistId: number;

  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
