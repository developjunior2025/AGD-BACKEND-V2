import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ModelCatalog } from './model-catalog.entity';

/** ir_model_fields — catálogo plano de campos de un modelo. */
@Entity('ir_model_fields')
@Index(['modelId', 'fieldName'], { unique: true })
export class ModelField extends BaseEntity {
  @ManyToOne(() => ModelCatalog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: ModelCatalog;

  @Column({ name: 'model_id' })
  modelId: number;

  @Column({ name: 'field_name', type: 'varchar', length: 128 })
  fieldName: string;

  @Column({ name: 'field_label', type: 'varchar', length: 128 })
  fieldLabel: string;

  @Column({ name: 'field_type', type: 'varchar', length: 32 })
  fieldType: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;
}
