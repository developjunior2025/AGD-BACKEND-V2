import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UomCategory } from './uom-category.entity';

@Entity('uom_uom')
export class Uom extends BaseEntity {
  @Column({ type: 'varchar', length: 32 })
  name: string;

  @ManyToOne(() => UomCategory, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: UomCategory;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  factor: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
