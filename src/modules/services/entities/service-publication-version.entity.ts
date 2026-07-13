import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServicePublication } from './service-publication.entity';

export enum ServicePublicationVersionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('agd_service_publication_version')
@Index(['servicePublicationId', 'versionNumber'], { unique: true })
export class ServicePublicationVersion extends BaseEntity {
  @ManyToOne(() => ServicePublication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_publication_id' })
  servicePublication: ServicePublication;

  @Column({ name: 'service_publication_id' })
  servicePublicationId: number;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({
    type: 'enum',
    enum: ServicePublicationVersionStatus,
    default: ServicePublicationVersionStatus.DRAFT,
  })
  status: ServicePublicationVersionStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'published_by_id', type: 'int', nullable: true })
  publishedById: number | null;
}
