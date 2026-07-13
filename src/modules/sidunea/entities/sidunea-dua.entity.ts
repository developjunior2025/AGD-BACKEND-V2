import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SidUneaDuaStatus {
  REGISTERED = 'registered',
  IN_REVIEW = 'in_review',
  CLEARED = 'cleared',
  REJECTED = 'rejected',
}

/**
 * agd_sidunea_dua — espejo mínimo de la Declaración Única Aduanera para
 * soportar la consulta de solo lectura del perfil Consultor (Fase 4). Los
 * campos aduaneros completos (ítems, régimen, liquidación) se agregan en
 * Fase 6 (agente de aduanas).
 */
@Entity('agd_sidunea_dua')
export class SidUneaDua extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Index({ unique: true })
  @Column({ name: 'dua_number', type: 'varchar', length: 64 })
  duaNumber: string;

  @Column({
    type: 'enum',
    enum: SidUneaDuaStatus,
    default: SidUneaDuaStatus.REGISTERED,
  })
  status: SidUneaDuaStatus;

  @Column({ name: 'registered_at', type: 'timestamp' })
  registeredAt: Date;
}
