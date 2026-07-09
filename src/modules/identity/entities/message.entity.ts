import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum MessageType {
  AUDIT = 'audit',
  NOTE = 'note',
  NOTIFICATION = 'notification',
}

/**
 * mail_message — bitácora/auditoría genérica ligada polimórficamente a
 * cualquier modelo (resModel, resId). Se usa en Fase 1 para el historial
 * de accesos y eventos de seguridad de cuenta.
 */
@Entity('mail_message')
@Index(['resModel', 'resId'])
export class Message extends BaseEntity {
  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageType,
    default: MessageType.NOTE,
  })
  messageType: MessageType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'author_id', type: 'int', nullable: true })
  authorId: number | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;
}
