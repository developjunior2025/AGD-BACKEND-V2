import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DocumentRequirement } from '../../documents/entities/document-requirement.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';

/** agd_service_requirement — documentos exigidos para contratar un servicio. */
@Entity('agd_service_requirement')
@Index(['productTemplateId', 'documentRequirementId'], { unique: true })
export class ServiceRequirement extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @ManyToOne(() => DocumentRequirement, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_requirement_id' })
  documentRequirement: DocumentRequirement;

  @Column({ name: 'document_requirement_id' })
  documentRequirementId: number;

  @Column({ type: 'boolean', default: true })
  mandatory: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
