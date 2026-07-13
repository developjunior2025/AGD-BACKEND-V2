import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Website } from './website.entity';
import { WebsitePage } from './website-page.entity';

/**
 * website_menu (+ext agd_external_platform_link vía isExternal/externalUrl).
 */
@Entity('website_menu')
export class WebsiteMenu extends BaseEntity {
  @ManyToOne(() => Website, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'website_id' })
  website: Website;

  @Column({ name: 'website_id' })
  websiteId: number;

  @Column({ type: 'varchar', length: 128 })
  label: string;

  @ManyToOne(() => WebsiteMenu, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: WebsiteMenu | null;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @ManyToOne(() => WebsitePage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'page_id' })
  page: WebsitePage | null;

  @Column({ name: 'page_id', type: 'int', nullable: true })
  pageId: number | null;

  @Column({ name: 'is_external', type: 'boolean', default: false })
  isExternal: boolean;

  @Column({
    name: 'external_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalUrl: string | null;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
