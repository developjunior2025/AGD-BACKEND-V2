import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AccountMove } from './account-move.entity';

export enum AccountPaymentState {
  DRAFT = 'draft',
  POSTED = 'posted',
}

/**
 * account_payment — registro del pago (sin pasarela real: se asienta
 * manualmente/por un administrador, consistente con el backend standalone).
 */
@Entity('account_payment')
export class AccountPayment extends BaseEntity {
  @ManyToOne(() => AccountMove, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_move_id' })
  accountMove: AccountMove;

  @Column({ name: 'account_move_id' })
  accountMoveId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string;

  @Column({ name: 'payment_date', type: 'timestamp' })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 32, nullable: true })
  method: string | null;

  @Column({
    type: 'enum',
    enum: AccountPaymentState,
    default: AccountPaymentState.POSTED,
  })
  state: AccountPaymentState;
}
