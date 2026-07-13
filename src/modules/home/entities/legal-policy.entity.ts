import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum LegalPolicyCode {
  TERMS = 'terms',
  PRIVACY = 'privacy',
  SECURITY = 'security',
}

/**
 * agd_legal_policy — catálogo de políticas publicables. El código coincide
 * con PolicyCode del módulo enablement (agd_policy_acceptance), que
 * referencia estos mismos valores por texto (code + versionLabel) en lugar
 * de FK, ya que la aceptación puede ocurrir antes de que exista esta
 * publicación formal.
 */
@Entity('agd_legal_policy')
export class LegalPolicy extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'enum', enum: LegalPolicyCode })
  code: LegalPolicyCode;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
