import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('uom_category')
export class UomCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name: string;
}
