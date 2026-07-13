import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from './currency.entity';

@Entity('agd_tariff_rule')
export class TariffRule extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => Currency, { eager: true, nullable: true })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency | null;

  @Column({ name: 'currency_id', type: 'int', nullable: true })
  currencyId: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  amount: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
