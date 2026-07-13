import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('agd_sla_rule')
export class SlaRule extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_hours', type: 'int' })
  durationHours: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
