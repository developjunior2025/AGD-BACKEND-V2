import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** website — el portal en sí. Un solo registro activo en la práctica. */
@Entity('website')
export class Website extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
