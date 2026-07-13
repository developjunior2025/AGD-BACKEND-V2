import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * ir_model — catálogo de modelos de negocio (los mismos identificadores
 * lógicos de ModelName). No hace introspección real del ORM: es un
 * registro plano que alimenta la matriz de gobernanza.
 */
@Entity('ir_model')
export class ModelCatalog extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'model_name', type: 'varchar', length: 128 })
  modelName: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
