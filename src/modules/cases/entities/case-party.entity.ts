import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Partner } from '../../identity/entities/partner.entity';
import { Case } from './case.entity';

export enum CasePartyRole {
  OWNER = 'owner',
  COUNTERPART = 'counterpart',
  AGENT = 'agent',
  TRANSPORTER = 'transporter',
  CONSULTANT = 'consultant',
}

@Entity('agd_case_party')
@Index(['caseId', 'partnerId', 'role'], { unique: true })
export class CaseParty extends BaseEntity {
  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'case_id' })
  caseId: number;

  @ManyToOne(() => Partner, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @Column({ name: 'partner_id' })
  partnerId: number;

  @Column({ type: 'enum', enum: CasePartyRole })
  role: CasePartyRole;
}
