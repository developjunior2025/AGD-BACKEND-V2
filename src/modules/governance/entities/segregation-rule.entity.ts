import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';

/** agd_segregation_rule — pares de perfiles incompatibles (segregación de funciones). */
@Entity('agd_segregation_rule')
@Index(['groupAId', 'groupBId'], { unique: true })
export class SegregationRule extends BaseEntity {
  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_a_id' })
  groupA: Group;

  @Column({ name: 'group_a_id' })
  groupAId: number;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_b_id' })
  groupB: Group;

  @Column({ name: 'group_b_id' })
  groupBId: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
