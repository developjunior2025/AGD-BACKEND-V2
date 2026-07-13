import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductTemplate } from './product-template.entity';

/**
 * resource_calendar (+ext agd_service_availability vía service_id).
 * Cuando service_id es null, representa un calendario general de la
 * empresa; cuando está presente, es la disponibilidad de un servicio.
 */
@Entity('resource_calendar')
export class ResourceCalendar extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @ManyToOne(() => ProductTemplate, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ProductTemplate | null;

  @Column({ name: 'service_id', type: 'int', nullable: true })
  serviceId: number | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
