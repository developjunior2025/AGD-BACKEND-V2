import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum DiscrepancyMatrixStatus {
  PENDING = 'pending',
  RECONCILED = 'reconciled',
}

/** agd_discrepancy_matrix — conciliación consolidada SIDUNEA–AGD de un expediente. */
@Entity('agd_discrepancy_matrix')
export class DiscrepancyMatrix extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'total_discrepancies', type: 'int', default: 0 })
  totalDiscrepancies: number;

  @Column({
    type: 'enum',
    enum: DiscrepancyMatrixStatus,
    default: DiscrepancyMatrixStatus.PENDING,
  })
  status: DiscrepancyMatrixStatus;

  @Column({ name: 'reconciled_at', type: 'timestamp', nullable: true })
  reconciledAt: Date | null;
}
