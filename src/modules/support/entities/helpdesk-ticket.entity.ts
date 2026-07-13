import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum HelpdeskTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/** helpdesk_ticket — centro de ayuda del cliente del marketplace. */
@Entity('helpdesk_ticket')
export class HelpdeskTicket extends BaseEntity {
  @ManyToOne(() => Partner, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: HelpdeskTicketStatus,
    default: HelpdeskTicketStatus.OPEN,
  })
  status: HelpdeskTicketStatus;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;
}
