import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';

export enum CustomsDeclarationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  CLEARED = 'cleared',
  REJECTED = 'rejected',
}

/** agd_customs_declaration — expediente aduanero digital que gestiona el agente para un caso. */
@Entity('agd_customs_declaration')
export class CustomsDeclaration extends BaseEntity {
  @Column({ name: 'case_id', type: 'int' })
  caseId: number;

  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customs_agent_partner_id' })
  customsAgentPartner: Partner;

  @Column({ name: 'customs_agent_partner_id' })
  customsAgentPartnerId: number;

  @Column({
    type: 'enum',
    enum: CustomsDeclarationStatus,
    default: CustomsDeclarationStatus.DRAFT,
  })
  status: CustomsDeclarationStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'declared_at', type: 'timestamp', nullable: true })
  declaredAt: Date | null;
}
