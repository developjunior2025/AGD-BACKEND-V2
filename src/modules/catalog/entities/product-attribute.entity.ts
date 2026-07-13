import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product_attribute')
export class ProductAttribute extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name: string;
}
