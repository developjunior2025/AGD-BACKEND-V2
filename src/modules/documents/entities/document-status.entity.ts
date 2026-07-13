import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Document } from './document.entity';

export enum DocumentReviewStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/** agd_document_status — estado de revisión vigente de un documento. */
@Entity('agd_document_status')
export class DocumentStatus extends BaseEntity {
  @OneToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Index({ unique: true })
  @Column({ name: 'document_id' })
  documentId: number;

  @Column({
    type: 'enum',
    enum: DocumentReviewStatus,
    default: DocumentReviewStatus.PENDING,
  })
  status: DocumentReviewStatus;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'reviewed_by_id', type: 'int', nullable: true })
  reviewedById: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
