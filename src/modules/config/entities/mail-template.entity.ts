import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * mail_template — catálogo de plantillas de notificación. El envío real
 * (correo/SMS) queda fuera de alcance de este backend standalone; esta
 * tabla solo registra el contenido versionado que un proveedor futuro usaría.
 */
@Entity('mail_template')
export class MailTemplate extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
