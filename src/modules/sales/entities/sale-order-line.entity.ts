import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';
import { SaleOrder } from './sale-order.entity';

/** sale_order_line (+ext agd_quote_line, agd_service_contract_line). */
@Entity('sale_order_line')
export class SaleOrderLine extends BaseEntity {
  @ManyToOne(() => SaleOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_order_id' })
  saleOrder: SaleOrder;

  @Column({ name: 'sale_order_id' })
  saleOrderId: number;

  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1 })
  quantity: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: string;
}
