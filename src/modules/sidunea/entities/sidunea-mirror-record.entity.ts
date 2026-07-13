import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SidUneaRecordType {
  DUA = 'dua',
  MANIFEST = 'manifest',
  EXIT_PASS = 'exit_pass',
  REGIME = 'regime',
  INSPECTION = 'inspection',
  TAX_SIMULATION = 'tax_simulation',
}

/**
 * agd_sidunea_mirror_record — bitácora genérica de sincronización en espejo
 * contra SIDUNEA (sin integración electrónica real: los datos se cargan
 * manualmente por el agente de aduanas/TOS en fases posteriores). Cada
 * tabla tipada (agd_sidunea_dua, etc.) también escribe aquí para trazabilidad.
 */
@Entity('agd_sidunea_mirror_record')
@Index(['caseId'])
export class SidUneaMirrorRecord extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'record_type', type: 'enum', enum: SidUneaRecordType })
  recordType: SidUneaRecordType;

  @Column({ name: 'reference_number', type: 'varchar', length: 64 })
  referenceNumber: string;

  @Column({ name: 'mirrored_at', type: 'timestamp' })
  mirroredAt: Date;

  @Column({ name: 'raw_payload', type: 'text', nullable: true })
  rawPayload: string | null;
}
