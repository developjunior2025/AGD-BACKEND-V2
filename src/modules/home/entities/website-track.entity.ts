import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { WebsiteVisitor } from './website-visitor.entity';

/** website_track — vista de página individual de un visitante. */
@Entity('website_track')
@Index(['visitorId'])
export class WebsiteTrack extends BaseEntity {
  @ManyToOne(() => WebsiteVisitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor: WebsiteVisitor;

  @Column({ name: 'visitor_id' })
  visitorId: number;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ name: 'visited_at', type: 'timestamp' })
  visitedAt: Date;
}
