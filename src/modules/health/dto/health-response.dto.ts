import { HealthStatus } from '../entities/health-check-log.entity';

export class HealthResponseDto {
  status: HealthStatus;
  timestamp: string;
  database: 'up' | 'down';
}
