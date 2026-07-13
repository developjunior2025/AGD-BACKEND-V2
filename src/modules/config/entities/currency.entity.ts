import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('res_currency')
export class Currency extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 3 })
  code: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 8 })
  symbol: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
