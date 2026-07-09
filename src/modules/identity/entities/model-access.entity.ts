import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from './group.entity';

/**
 * ir_model_access — permisos CRUD por (grupo, modelo de negocio).
 * `modelName` es un identificador lógico estable (p.ej. 'agd_case',
 * 'agd_user_enablement_request'), no el nombre de tabla físico.
 */
@Entity('ir_model_access')
@Index(['groupId', 'modelName'], { unique: true })
export class ModelAccess extends BaseEntity {
  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'model_name', type: 'varchar', length: 128 })
  modelName: string;

  @Column({ name: 'perm_read', type: 'boolean', default: false })
  permRead: boolean;

  @Column({ name: 'perm_write', type: 'boolean', default: false })
  permWrite: boolean;

  @Column({ name: 'perm_create', type: 'boolean', default: false })
  permCreate: boolean;

  @Column({ name: 'perm_unlink', type: 'boolean', default: false })
  permUnlink: boolean;
}
