import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';

/** rating_rating — reseña/calificación genérica ligada a cualquier modelo. */
@Entity('rating_rating')
@Index(['resModel', 'resId'])
export class Rating extends BaseEntity {
  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @ManyToOne(() => Partner, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'rated_by_partner_id' })
  ratedByPartner: Partner | null;

  @Column({ name: 'rated_by_partner_id', type: 'int', nullable: true })
  ratedByPartnerId: number | null;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'rated_at', type: 'timestamp' })
  ratedAt: Date;
}
