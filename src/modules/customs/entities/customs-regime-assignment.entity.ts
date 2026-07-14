import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SidUneaCustomsRegime } from '../../sidunea/entities/sidunea-customs-regime.entity';
import { CustomsDeclaration } from './customs-declaration.entity';

/** agd_customs_regime_assignment — régimen aduanero asignado a una declaración. */
@Entity('agd_customs_regime_assignment')
export class CustomsRegimeAssignment extends BaseEntity {
  @ManyToOne(() => CustomsDeclaration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customs_declaration_id' })
  customsDeclaration: CustomsDeclaration;

  @Index({ unique: true })
  @Column({ name: 'customs_declaration_id' })
  customsDeclarationId: number;

  @ManyToOne(() => SidUneaCustomsRegime, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customs_regime_id' })
  customsRegime: SidUneaCustomsRegime;

  @Column({ name: 'customs_regime_id' })
  customsRegimeId: number;

  @Column({ name: 'assigned_at', type: 'timestamp' })
  assignedAt: Date;

  @Column({ name: 'assigned_by_id', type: 'int', nullable: true })
  assignedById: number | null;
}
