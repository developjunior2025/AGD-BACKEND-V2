import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** website_visitor — visitante anónimo identificado por un token de sesión. */
@Entity('website_visitor')
export class WebsiteVisitor extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'session_token', type: 'varchar', length: 64 })
  sessionToken: string;

  @Column({ name: 'first_visit_at', type: 'timestamp' })
  firstVisitAt: Date;

  @Column({ name: 'last_visit_at', type: 'timestamp' })
  lastVisitAt: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;
}
