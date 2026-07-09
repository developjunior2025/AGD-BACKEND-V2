import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }

  @Get('history')
  history(@Query() query: PaginationQueryDto) {
    return this.healthService.history(query);
  }
}
