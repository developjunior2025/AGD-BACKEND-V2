import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { ProductProduct } from './product-product.entity';

@Entity('product_product_attribute_value_rel')
@Index(['productProductId', 'attributeValueId'], { unique: true })
export class ProductProductAttributeValue extends BaseEntity {
  @ManyToOne(() => ProductProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_product_id' })
  productProduct: ProductProduct;

  @Column({ name: 'product_product_id' })
  productProductId: number;

  @ManyToOne(() => ProductAttributeValue, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: ProductAttributeValue;

  @Column({ name: 'attribute_value_id' })
  attributeValueId: number;
}
