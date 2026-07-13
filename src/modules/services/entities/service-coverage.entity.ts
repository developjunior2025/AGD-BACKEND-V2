import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';

/** agd_service_coverage — zona/región geográfica donde aplica el servicio. */
@Entity('agd_service_coverage')
@Index(['productTemplateId', 'zone'], { unique: true })
export class ServiceCoverage extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({ type: 'varchar', length: 128 })
  zone: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
