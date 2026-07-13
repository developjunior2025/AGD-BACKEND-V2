import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from './currency.entity';

@Entity('res_currency_rate')
@Index(['currencyId', 'rateDate'], { unique: true })
export class CurrencyRate extends BaseEntity {
  @ManyToOne(() => Currency, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ name: 'rate_date', type: 'date' })
  rateDate: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  rate: string;
}
