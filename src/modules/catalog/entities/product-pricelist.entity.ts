import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from '../../config/entities/currency.entity';

@Entity('product_pricelist')
export class ProductPricelist extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => Currency, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
