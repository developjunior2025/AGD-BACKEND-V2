import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('stock_warehouse')
export class StockWarehouse extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  code: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
