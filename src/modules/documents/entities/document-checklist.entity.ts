import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Document } from './document.entity';
import { DocumentRequirement } from './document-requirement.entity';

/**
 * agd_document_checklist — instancia de un requisito documental para un
 * contexto concreto (p.ej. un expediente), vinculado polimórficamente vía
 * (resModel, resId) igual que ir_attachment/mail_message.
 */
@Entity('agd_document_checklist')
@Index(['resModel', 'resId'])
@Index(['resModel', 'resId', 'documentRequirementId'], { unique: true })
export class DocumentChecklist extends BaseEntity {
  @Column({ name: 'res_model', type: 'varchar', length: 128 })
  resModel: string;

  @Column({ name: 'res_id', type: 'int' })
  resId: number;

  @ManyToOne(() => DocumentRequirement, { eager: true })
  @JoinColumn({ name: 'document_requirement_id' })
  documentRequirement: DocumentRequirement;

  @Column({ name: 'document_requirement_id' })
  documentRequirementId: number;

  @Column({ type: 'boolean', default: false })
  fulfilled: boolean;

  @ManyToOne(() => Document, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'document_id' })
  document: Document | null;

  @Column({ name: 'document_id', type: 'int', nullable: true })
  documentId: number | null;

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
