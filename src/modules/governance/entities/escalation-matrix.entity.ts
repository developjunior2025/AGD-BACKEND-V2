import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';

@Entity('agd_escalation_matrix')
export class EscalationMatrix extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_group_id' })
  fromGroup: Group;

  @Column({ name: 'from_group_id' })
  fromGroupId: number;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_group_id' })
  toGroup: Group;

  @Column({ name: 'to_group_id' })
  toGroupId: number;

  @Column({ name: 'after_hours', type: 'int' })
  afterHours: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
