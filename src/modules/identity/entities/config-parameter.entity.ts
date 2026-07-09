import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('ir_config_parameter')
export class ConfigParameter extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
