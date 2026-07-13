import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_attribute_value')
export class ProductAttributeValue extends BaseEntity {
  @ManyToOne(() => ProductAttribute, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;

  @Column({ name: 'attribute_id' })
  attributeId: number;

  @Column({ type: 'varchar', length: 64 })
  value: string;
}
