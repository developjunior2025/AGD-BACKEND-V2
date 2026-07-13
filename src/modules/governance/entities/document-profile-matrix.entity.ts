import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Group } from '../../identity/entities/group.entity';
import { DocumentRequirement } from '../../documents/entities/document-requirement.entity';

/** agd_document_profile_matrix — qué requisitos documentales aplican a cada perfil. */
@Entity('agd_document_profile_matrix')
@Index(['groupId', 'documentRequirementId'], { unique: true })
export class DocumentProfileMatrix extends BaseEntity {
  @ManyToOne(() => Group, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id' })
  groupId: number;

  @ManyToOne(() => DocumentRequirement, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_requirement_id' })
  documentRequirement: DocumentRequirement;

  @Column({ name: 'document_requirement_id' })
  documentRequirementId: number;

  @Column({ type: 'boolean', default: true })
  mandatory: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
