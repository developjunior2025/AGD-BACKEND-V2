import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product_category')
export class ProductCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => ProductCategory, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: ProductCategory | null;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
