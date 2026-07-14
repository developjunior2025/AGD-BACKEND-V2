import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum SidUneaDuaStatus {
  REGISTERED = 'registered',
  IN_REVIEW = 'in_review',
  CLEARED = 'cleared',
  REJECTED = 'rejected',
}

/**
 * agd_sidunea_dua — espejo de la Declaración Única Aduanera. El contrato
 * mínimo nació en Fase 4 (consulta de solo lectura del Consultor); Fase 6
 * (agente de aduanas) agrega `customsDeclarationId` (de qué declaración
 * formal se generó el espejo) y las líneas (`agd_sidunea_dua_item`).
 */
@Entity('agd_sidunea_dua')
export class SidUneaDua extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @Column({ name: 'customs_declaration_id', type: 'int', nullable: true })
  customsDeclarationId: number | null;

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
