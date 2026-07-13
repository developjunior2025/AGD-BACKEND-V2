import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';
import { ServiceCart } from './service-cart.entity';

@Entity('agd_service_cart_item')
@Index(['cartId', 'productTemplateId'], { unique: true })
export class ServiceCartItem extends BaseEntity {
  @ManyToOne(() => ServiceCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: ServiceCart;

  @Column({ name: 'cart_id' })
  cartId: number;

  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    name: 'unit_price_snapshot',
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  unitPriceSnapshot: string;

  @Column({ name: 'currency_id' })
  currencyId: number;
}
