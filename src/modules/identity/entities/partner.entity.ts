import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PartnerKind {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

/**
 * res_partner — persona o empresa. Los campos de perfil especializados
 * (licencia de agente aduanero, datos de conductor, etc.) se agregan en
 * fases posteriores como columnas propias de este mismo modelo (herencia
 * Odoo-style), no como tablas nuevas.
 */
@Entity('res_partner')
export class Partner extends BaseEntity {
  @Column({ name: 'kind', type: 'enum', enum: PartnerKind })
  kind: PartnerKind;

  @Column({ name: 'first_name', type: 'varchar', length: 128, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 128, nullable: true })
  lastName: string | null;

  @Column({ name: 'legal_name', type: 'varchar', length: 255, nullable: true })
  legalName: string | null;

  @Index({ unique: true })
  @Column({ name: 'rif', type: 'varchar', length: 16 })
  rif: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  get displayName(): string {
    return this.kind === PartnerKind.COMPANY
      ? (this.legalName ?? this.rif)
      : `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim() || this.rif;
  }
}
