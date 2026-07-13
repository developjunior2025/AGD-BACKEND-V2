import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';
import { ProductCategory } from './product-category.entity';
import { Uom } from './uom.entity';

/**
 * product_template (+ext agd_service). Es la definición del servicio del
 * marketplace: el catálogo original proponía agd_service/agd_service_detail
 * como tablas propias, pero se resuelven extendiendo este modelo (según
 * la comparación contra Odoo documentada en RESUME_1.MD).
 */
@Entity('product_template')
export class ProductTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => ProductCategory, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Uom, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uom_id' })
  uom: Uom;

  @Column({ name: 'uom_id' })
  uomId: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => Partner, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'provider_partner_id' })
  providerPartner: Partner | null;

  @Column({ name: 'provider_partner_id', type: 'int', nullable: true })
  providerPartnerId: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
