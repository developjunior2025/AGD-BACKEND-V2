import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * agd_sidunea_modshd_exit_pass — espejo mínimo de la hoja de salida (MODSHD).
 * Se completa funcionalmente en Fase 8 (TOS y transporte).
 */
@Entity('agd_sidunea_modshd_exit_pass')
export class SidUneaModshdExitPass extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Index({ unique: true })
  @Column({ name: 'exit_pass_number', type: 'varchar', length: 64 })
  exitPassNumber: string;

  @Column({ name: 'issued_at', type: 'timestamp', nullable: true })
  issuedAt: Date | null;
}
