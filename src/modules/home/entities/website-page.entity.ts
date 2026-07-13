import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Website } from './website.entity';

export enum WebsitePageType {
  GENERIC = 'generic',
  NOTICE = 'notice',
  FAQ = 'faq',
}

/**
 * website_page (+ext). agd_public_notice y agd_faq del catálogo original
 * se resuelven aquí vía `pageType`, no como tablas propias — así lo
 * determinó la comparación contra el modelo nativo de Odoo.
 */
@Entity('website_page')
@Index(['websiteId', 'slug'], { unique: true })
export class WebsitePage extends BaseEntity {
  @ManyToOne(() => Website, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'website_id' })
  website: Website;

  @Column({ name: 'website_id' })
  websiteId: number;

  @Column({ type: 'varchar', length: 128 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    name: 'page_type',
    type: 'enum',
    enum: WebsitePageType,
    default: WebsitePageType.GENERIC,
  })
  pageType: WebsitePageType;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
