import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheckLog } from './entities/health-check-log.entity';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthCheckLog])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
