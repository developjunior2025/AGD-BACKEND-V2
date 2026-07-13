import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('documents_tag')
export class Tag extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  color: string | null;
}
