import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Document } from './document.entity';
import { Tag } from './tag.entity';

@Entity('documents_document_tag_rel')
@Index(['documentId', 'tagId'], { unique: true })
export class DocumentTag extends BaseEntity {
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: number;

  @ManyToOne(() => Tag, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @Column({ name: 'tag_id' })
  tagId: number;
}
