import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from '../../config/entities/currency.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum SaleOrderType {
  QUOTE = 'quote',
  CONTRACT = 'contract',
}

export enum SaleOrderState {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

/**
 * sale_order (+ext agd_quote, agd_service_contract). Una misma tabla cubre
 * tanto la cotización de un prestador como el contrato ya confirmado —
 * `orderType` distingue el rol, igual que el resto de extensiones de
 * modelos nativos de Odoo documentadas en el proyecto.
 */
@Entity('sale_order')
export class SaleOrder extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_partner_id' })
  providerPartner: Partner;

  @Column({ name: 'provider_partner_id' })
  providerPartnerId: number;

  @Column({ name: 'quote_request_id', type: 'int', nullable: true })
  quoteRequestId: number | null;

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: SaleOrderType,
    default: SaleOrderType.QUOTE,
  })
  orderType: SaleOrderType;

  @Column({ type: 'enum', enum: SaleOrderState, default: SaleOrderState.DRAFT })
  state: SaleOrderState;

  @ManyToOne(() => Currency, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({
    name: 'amount_total',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  amountTotal: string;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;
}
