import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('account_tax')
export class Tax extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
