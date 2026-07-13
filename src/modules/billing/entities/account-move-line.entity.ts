import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AccountMove } from './account-move.entity';

@Entity('account_move_line')
export class AccountMoveLine extends BaseEntity {
  @ManyToOne(() => AccountMove, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_move_id' })
  accountMove: AccountMove;

  @Column({ name: 'account_move_id' })
  accountMoveId: number;

  @Column({ name: 'sale_order_line_id', type: 'int', nullable: true })
  saleOrderLineId: number | null;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1 })
  quantity: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: string;
}
