import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { QuoteRequest } from './quote-request.entity';
import { SaleOrder } from './sale-order.entity';

/** agd_quote_comparison — decisión del cliente entre las cotizaciones recibidas. */
@Entity('agd_quote_comparison')
export class QuoteComparison extends BaseEntity {
  @ManyToOne(() => QuoteRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_request_id' })
  quoteRequest: QuoteRequest;

  @Index({ unique: true })
  @Column({ name: 'quote_request_id' })
  quoteRequestId: number;

  @ManyToOne(() => SaleOrder, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'selected_sale_order_id' })
  selectedSaleOrder: SaleOrder | null;

  @Column({ name: 'selected_sale_order_id', type: 'int', nullable: true })
  selectedSaleOrderId: number | null;

  @Column({ name: 'compared_at', type: 'timestamp', nullable: true })
  comparedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
