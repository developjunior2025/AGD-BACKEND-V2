import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockLocation } from '../../warehouse/entities/stock-location.entity';

export enum CustodyRecordStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
}

/** agd_wms_custody_record — custodia de la mercancía de un expediente en el depósito. */
@Entity('agd_wms_custody_record')
export class CustodyRecord extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @ManyToOne(() => StockLocation, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location: StockLocation;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamp', nullable: true })
  endAt: Date | null;

  @Column({
    type: 'enum',
    enum: CustodyRecordStatus,
    default: CustodyRecordStatus.ACTIVE,
  })
  status: CustodyRecordStatus;
}
