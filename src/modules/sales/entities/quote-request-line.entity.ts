import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';
import { QuoteRequest } from './quote-request.entity';

/** agd_quote_request_line — ítem solicitado dentro de una cotización. */
@Entity('agd_quote_request_line')
export class QuoteRequestLine extends BaseEntity {
  @ManyToOne(() => QuoteRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_request_id' })
  quoteRequest: QuoteRequest;

  @Column({ name: 'quote_request_id' })
  quoteRequestId: number;

  @ManyToOne(() => ProductTemplate, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate | null;

  @Column({ name: 'product_template_id', type: 'int', nullable: true })
  productTemplateId: number | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
