import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductCategory } from '../../catalog/entities/product-category.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum QuoteRequestStatus {
  OPEN = 'open',
  COMPARED = 'compared',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

/** agd_quote_request — solicitud de cotización multi-prestador del cliente. */
@Entity('agd_quote_request')
export class QuoteRequest extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_partner_id' })
  requesterPartner: Partner;

  @Column({ name: 'requester_partner_id' })
  requesterPartnerId: number;

  @ManyToOne(() => ProductCategory, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory | null;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: QuoteRequestStatus,
    default: QuoteRequestStatus.OPEN,
  })
  status: QuoteRequestStatus;
}
