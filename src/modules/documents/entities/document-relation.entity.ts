import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Document } from './document.entity';

export enum DocumentRelationType {
  AMENDS = 'amends',
  REPLACES = 'replaces',
  SUPPORTS = 'supports',
}

/** agd_document_relation — relación entre dos documentos (enmienda, reemplazo, soporte). */
@Entity('agd_document_relation')
@Index(['sourceDocumentId', 'targetDocumentId', 'relationType'], {
  unique: true,
})
export class DocumentRelation extends BaseEntity {
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_document_id' })
  sourceDocument: Document;

  @Column({ name: 'source_document_id' })
  sourceDocumentId: number;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_document_id' })
  targetDocument: Document;

  @Column({ name: 'target_document_id' })
  targetDocumentId: number;

  @Column({
    name: 'relation_type',
    type: 'enum',
    enum: DocumentRelationType,
  })
  relationType: DocumentRelationType;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
