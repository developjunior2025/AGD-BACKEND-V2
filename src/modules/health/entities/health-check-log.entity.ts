import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum HealthStatus {
  OK = 'ok',
  ERROR = 'error',
}

@Entity('agd_health_check_log')
export class HealthCheckLog extends BaseEntity {
  @Column({ type: 'enum', enum: HealthStatus })
  status: HealthStatus;

  @Column({ type: 'text', nullable: true })
  detail: string | null;
}
