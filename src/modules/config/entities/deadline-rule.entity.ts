import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('agd_deadline_rule')
export class DeadlineRule extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'days_to_deadline', type: 'int' })
  daysToDeadline: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
