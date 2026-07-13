import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum ServiceCartStatus {
  OPEN = 'open',
  CHECKED_OUT = 'checked_out',
  ABANDONED = 'abandoned',
}

/** agd_service_cart — carrito de servicios del cliente. */
@Entity('agd_service_cart')
export class ServiceCart extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @Column({
    type: 'enum',
    enum: ServiceCartStatus,
    default: ServiceCartStatus.OPEN,
  })
  status: ServiceCartStatus;
}
