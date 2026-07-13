import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from './product-template.entity';

/** product_product — variante vendible de un product_template. */
@Entity('product_product')
export class ProductProduct extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  sku: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
