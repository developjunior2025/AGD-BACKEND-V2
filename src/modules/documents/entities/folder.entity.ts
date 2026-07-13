import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * documents_folder (+ext agd_case_folder). El vínculo a expediente es un
 * entero simple sin relación TypeORM formal: el módulo de expedientes
 * (agd_case) se construye después y no debe crear una dependencia circular
 * entre módulos de Fase 2.
 */
@Entity('documents_folder')
export class Folder extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => Folder, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Folder | null;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ name: 'case_id', type: 'int', nullable: true })
  caseId: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
