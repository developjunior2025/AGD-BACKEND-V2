import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * agd_sidunea_modcar_manifest — espejo mínimo del manifiesto de carga
 * (MODCAR). Se completa funcionalmente en Fase 8 (TOS y transporte).
 */
@Entity('agd_sidunea_modcar_manifest')
export class SidUneaModcarManifest extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Index({ unique: true })
  @Column({ name: 'manifest_number', type: 'varchar', length: 64 })
  manifestNumber: string;

  @Column({
    name: 'carrier_name',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  carrierName: string | null;

  @Column({ name: 'arrival_date', type: 'date', nullable: true })
  arrivalDate: string | null;
}
