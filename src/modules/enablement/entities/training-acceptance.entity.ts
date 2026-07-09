import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** agd_user_training_acceptance — paso 8: aceptación formal del rol asignado. */
@Entity('agd_user_training_acceptance')
export class TrainingAcceptance extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'group_id', type: 'int' })
  groupId: number;

  @Column({ name: 'accepted_at', type: 'timestamp' })
  acceptedAt: Date;
}
