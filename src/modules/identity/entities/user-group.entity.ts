import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('res_groups_users_rel')
@Index(['userId', 'groupId'], { unique: true })
export class UserGroup extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: number;
}
