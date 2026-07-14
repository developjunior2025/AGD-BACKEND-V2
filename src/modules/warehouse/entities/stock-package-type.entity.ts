import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('stock_package_type')
export class StockPackageType extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name: string;
}
