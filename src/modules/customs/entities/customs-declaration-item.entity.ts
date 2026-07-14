import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CustomsDeclaration } from './customs-declaration.entity';

@Entity('agd_customs_declaration_item')
export class CustomsDeclarationItem extends BaseEntity {
  @ManyToOne(() => CustomsDeclaration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customs_declaration_id' })
  customsDeclaration: CustomsDeclaration;

  @Column({ name: 'customs_declaration_id' })
  customsDeclarationId: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'tariff_code', type: 'varchar', length: 32, nullable: true })
  tariffCode: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1 })
  quantity: string;

  @Column({ name: 'unit_value', type: 'decimal', precision: 18, scale: 2 })
  unitValue: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: string;
}
