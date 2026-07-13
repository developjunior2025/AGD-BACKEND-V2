import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** ir_sequence — generador de códigos correlativos (p.ej. expedientes, DUA). */
@Entity('ir_sequence')
export class Sequence extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  prefix: string | null;

  @Column({ type: 'int', default: 6 })
  padding: number;

  @Column({ name: 'last_number', type: 'int', default: 0 })
  lastNumber: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
