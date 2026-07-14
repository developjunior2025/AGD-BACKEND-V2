import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum StoragePeriodStatus {
  WITHIN_PERIOD = 'within_period',
  OVERDUE = 'overdue',
}

/** agd_wms_storage_period — plazo legal de depósito aduanero de un expediente. */
@Entity('agd_wms_storage_period')
export class StoragePeriod extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'legal_deadline', type: 'date' })
  legalDeadline: string;

  @Column({ name: 'extended_deadline', type: 'date', nullable: true })
  extendedDeadline: string | null;

  @Column({
    type: 'enum',
    enum: StoragePeriodStatus,
    default: StoragePeriodStatus.WITHIN_PERIOD,
  })
  status: StoragePeriodStatus;
}
