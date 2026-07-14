import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StockPackageType } from './stock-package-type.entity';

/** stock_quant_package — el "bulto" físico en el que viaja/se almacena la mercancía. */
@Entity('stock_quant_package')
export class StockQuantPackage extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  name: string;

  @ManyToOne(() => StockPackageType, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'package_type_id' })
  packageType: StockPackageType | null;

  @Column({ name: 'package_type_id', type: 'int', nullable: true })
  packageTypeId: number | null;
}
