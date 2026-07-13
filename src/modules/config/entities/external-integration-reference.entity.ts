import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * agd_external_integration_reference — catálogo de plataformas externas
 * referenciadas (SENIAT, Bolipuertos, SIDUNEA, etc.). Es un registro
 * informativo/de enlace, no una integración electrónica real.
 */
@Entity('agd_external_integration_reference')
export class ExternalIntegrationReference extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'base_url', type: 'varchar', length: 255, nullable: true })
  baseUrl: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
