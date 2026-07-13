import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * agd_document_requirement — catálogo de tipos de documento exigibles
 * (p.ej. "RIF", "Licencia de importador", "BL"). La asociación de qué
 * requisitos aplican a qué perfil vive en agd_document_profile_matrix
 * (módulo de gobernanza).
 */
@Entity('agd_document_requirement')
export class DocumentRequirement extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  mandatory: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
