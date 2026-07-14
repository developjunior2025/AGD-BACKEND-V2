import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ModaiInspectionResult {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** agd_sidunea_modai_inspection — espejo de la inspección aduanera (MODAI). */
@Entity('agd_sidunea_modai_inspection')
export class SidUneaModaiInspection extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Index({ unique: true })
  @Column({ name: 'inspection_number', type: 'varchar', length: 64 })
  inspectionNumber: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({
    type: 'enum',
    enum: ModaiInspectionResult,
    default: ModaiInspectionResult.PENDING,
  })
  result: ModaiInspectionResult;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
