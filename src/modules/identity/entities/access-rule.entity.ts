import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from './group.entity';

export enum AccessScope {
  OWN = 'own',
  COMPANY = 'company',
  ALL = 'all',
}

/**
 * ir_rule simplificado — alcance de lectura/escritura por (grupo, modelo).
 * Sustituye los dominios arbitrarios de Odoo por un enum cerrado que cubre
 * los tres casos reales del mapa del sitio: propio / de la empresa / todo.
 */
@Entity('ir_rule')
@Index(['groupId', 'modelName'], { unique: true })
export class AccessRule extends BaseEntity {
  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'model_name', type: 'varchar', length: 128 })
  modelName: string;

  @Column({ type: 'enum', enum: AccessScope, default: AccessScope.OWN })
  scope: AccessScope;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
