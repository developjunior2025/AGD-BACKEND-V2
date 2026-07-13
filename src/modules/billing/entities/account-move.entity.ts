import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Currency } from '../../config/entities/currency.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum AccountMoveType {
  OUT_INVOICE = 'out_invoice',
  OUT_REFUND = 'out_refund',
}

export enum AccountMoveState {
  DRAFT = 'draft',
  POSTED = 'posted',
  CANCELLED = 'cancelled',
}

/** account_move — factura/nota de crédito emitida a un cliente del marketplace. */
@Entity('account_move')
export class AccountMove extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @Column({ name: 'sale_order_id', type: 'int', nullable: true })
  saleOrderId: number | null;

  @Column({
    name: 'move_type',
    type: 'enum',
    enum: AccountMoveType,
    default: AccountMoveType.OUT_INVOICE,
  })
  moveType: AccountMoveType;

  @Column({
    type: 'enum',
    enum: AccountMoveState,
    default: AccountMoveState.DRAFT,
  })
  state: AccountMoveState;

  @ManyToOne(() => Currency, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ name: 'currency_id' })
  currencyId: number;

  @Column({ name: 'amount_total', type: 'decimal', precision: 18, scale: 2 })
  amountTotal: string;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;
}
