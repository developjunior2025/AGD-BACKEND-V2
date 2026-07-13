import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';

export enum ServicePublicationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
}

/** agd_service_publication — visibilidad pública de un servicio del catálogo. */
@Entity('agd_service_publication')
export class ServicePublication extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Index({ unique: true })
  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @Column({
    type: 'enum',
    enum: ServicePublicationStatus,
    default: ServicePublicationStatus.DRAFT,
  })
  status: ServicePublicationStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'published_by_id', type: 'int', nullable: true })
  publishedById: number | null;
}
