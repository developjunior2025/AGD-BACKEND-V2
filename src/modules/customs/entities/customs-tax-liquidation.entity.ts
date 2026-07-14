import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from '../../config/entities/currency.entity';
import { CustomsDeclaration } from './customs-declaration.entity';

/** agd_customs_tax_liquidation — liquidación simulada de tributos de una declaración. */
@Entity('agd_customs_tax_liquidation')
export class CustomsTaxLiquidation extends BaseEntity {
  @ManyToOne(() => CustomsDeclaration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customs_declaration_id' })
  customsDeclaration: CustomsDeclaration;

  @Index({ unique: true })
  @Column({ name: 'customs_declaration_id' })
  customsDeclarationId: number;

  @Column({ name: 'total_taxes', type: 'decimal', precision: 18, scale: 2 })
  totalTaxes: string;

  @Column({
    name: 'total_duties',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  totalDuties: string | null;

  @ManyToOne(() => Currency, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ name: 'calculated_at', type: 'timestamp' })
  calculatedAt: Date;

  @Column({ type: 'text', nullable: true })
  details: string | null;
}
