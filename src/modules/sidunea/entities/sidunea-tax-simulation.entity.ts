import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from '../../config/entities/currency.entity';

/**
 * agd_sidunea_tax_simulation — cálculo estimado ("¿cuánto pagaría?") previo
 * a la liquidación formal (agd_customs_tax_liquidation, Fase 6). No es
 * vinculante.
 */
@Entity('agd_sidunea_tax_simulation')
export class SidUneaTaxSimulation extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'simulated_at', type: 'timestamp' })
  simulatedAt: Date;

  @Column({ name: 'estimated_taxes', type: 'decimal', precision: 18, scale: 2 })
  estimatedTaxes: string;

  @ManyToOne(() => Currency, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ type: 'text', nullable: true })
  breakdown: string | null;
}
