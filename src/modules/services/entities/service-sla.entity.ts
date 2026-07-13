import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SlaRule } from '../../config/entities/sla-rule.entity';
import { ProductTemplate } from '../../catalog/entities/product-template.entity';

@Entity('agd_service_sla')
@Index(['productTemplateId', 'slaRuleId'], { unique: true })
export class ServiceSla extends BaseEntity {
  @ManyToOne(() => ProductTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplate;

  @Column({ name: 'product_template_id' })
  productTemplateId: number;

  @ManyToOne(() => SlaRule, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sla_rule_id' })
  slaRule: SlaRule;

  @Column({ name: 'sla_rule_id' })
  slaRuleId: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
