import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Folder } from './folder.entity';

/**
 * documents_document — envoltorio de gestión documental sobre un adjunto
 * físico (ir_attachment), vinculado opcionalmente a cualquier modelo de
 * negocio vía (resModel, resId), igual que ir_attachment.
 */
@Entity('documents_document')
@Index(['resModel', 'resId'])
export class Document extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Folder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder | null;

  @Column({ name: 'folder_id', type: 'int', nullable: true })
  folderId: number | null;

  @Column({ name: 'attachment_id', type: 'int', nullable: true })
  attachmentId: number | null;

  @Column({ name: 'res_model', type: 'varchar', length: 128, nullable: true })
  resModel: string | null;

  @Column({ name: 'res_id', type: 'int', nullable: true })
  resId: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
