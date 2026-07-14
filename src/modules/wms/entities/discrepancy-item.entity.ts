import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DiscrepancyMatrix } from './discrepancy-matrix.entity';

/** agd_discrepancy_item — línea de diferencia dentro de la matriz de conciliación. */
@Entity('agd_discrepancy_item')
export class DiscrepancyItem extends BaseEntity {
  @ManyToOne(() => DiscrepancyMatrix, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'discrepancy_matrix_id' })
  discrepancyMatrix: DiscrepancyMatrix;

  @Column({ name: 'discrepancy_matrix_id' })
  discrepancyMatrixId: number;

  @Column({
    name: 'sidunea_reference',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  sidUneaReference: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'quantity_difference',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  quantityDifference: string | null;

  @Column({ type: 'boolean', default: false })
  resolved: boolean;
}
