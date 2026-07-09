import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  HealthCheckLog,
  HealthStatus,
} from './entities/health-check-log.entity';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(HealthCheckLog)
    private readonly healthCheckLogRepository: Repository<HealthCheckLog>,
  ) {}

  async check(): Promise<HealthResponseDto> {
    let databaseUp = true;
    let detail: string | null = null;

    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      databaseUp = false;
      detail = error instanceof Error ? error.message : 'Unknown DB error';
      this.logger.error(
        'Database ping failed',
        error instanceof Error ? error.stack : undefined,
      );
    }

    const status = databaseUp ? HealthStatus.OK : HealthStatus.ERROR;

    if (databaseUp) {
      await this.healthCheckLogRepository.insert({ status, detail });
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      database: databaseUp ? 'up' : 'down',
    };
  }

  async history(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HealthCheckLog>> {
    const [data, total] = await this.healthCheckLogRepository.findAndCount({
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });

    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }
}
