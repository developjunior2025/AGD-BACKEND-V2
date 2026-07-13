import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';
import { ProcessRaciMatrix } from './process-raci-matrix.entity';

export enum RaciRole {
  RESPONSIBLE = 'responsible',
  ACCOUNTABLE = 'accountable',
  CONSULTED = 'consulted',
  INFORMED = 'informed',
}

@Entity('agd_raci_assignment')
@Index(['processRaciMatrixId', 'groupId'], { unique: true })
export class RaciAssignment extends BaseEntity {
  @ManyToOne(() => ProcessRaciMatrix, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_raci_matrix_id' })
  processRaciMatrix: ProcessRaciMatrix;

  @Column({ name: 'process_raci_matrix_id' })
  processRaciMatrixId: number;

  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ type: 'enum', enum: RaciRole })
  role: RaciRole;
}
