import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** agd_sidunea_customs_regime — catálogo de regímenes aduaneros (importación definitiva, admisión temporal, etc.). */
@Entity('agd_sidunea_customs_regime')
export class SidUneaCustomsRegime extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
