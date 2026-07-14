import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SidUneaDua } from './sidunea-dua.entity';

/** agd_sidunea_dua_item — línea de mercancía declarada dentro de una DUA espejo. */
@Entity('agd_sidunea_dua_item')
export class SidUneaDuaItem extends BaseEntity {
  @ManyToOne(() => SidUneaDua, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sidunea_dua_id' })
  sidUneaDua: SidUneaDua;

  @Column({ name: 'sidunea_dua_id' })
  sidUneaDuaId: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'tariff_code', type: 'varchar', length: 32, nullable: true })
  tariffCode: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1 })
  quantity: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  value: string;
}
