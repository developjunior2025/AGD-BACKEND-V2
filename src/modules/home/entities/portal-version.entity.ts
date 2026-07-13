import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** agd_portal_version — historial de versiones/releases del portal público. */
@Entity('agd_portal_version')
export class PortalVersion extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'version_label', type: 'varchar', length: 32 })
  versionLabel: string;

  @Column({ name: 'release_notes', type: 'text', nullable: true })
  releaseNotes: string | null;

  @Column({ name: 'released_at', type: 'timestamp' })
  releasedAt: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
