import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * ir_attachment — adjunto genérico ligado polimórficamente a cualquier
 * modelo de negocio vía (resModel, resId), igual que en Odoo.
 */
@Entity('ir_attachment')
@Index(['resModel', 'resId'])
export class Attachment extends BaseEntity {
  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 128 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  @Column({ name: 'storage_key', type: 'varchar', length: 512 })
  storageKey: string;

  @Column({ name: 'uploaded_by_id', type: 'int', nullable: true })
  uploadedById: number | null;
}
