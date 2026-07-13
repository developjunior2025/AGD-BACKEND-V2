import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum CrmLeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  DISCARDED = 'discarded',
}

/** crm_lead — registro de interés / contacto público (conversión de visitante). */
@Entity('crm_lead')
export class CrmLead extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  source: string | null;

  @Column({ type: 'enum', enum: CrmLeadStatus, default: CrmLeadStatus.NEW })
  status: CrmLeadStatus;
}
