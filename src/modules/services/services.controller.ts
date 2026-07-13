import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { ListServicesDto } from '../catalog/dto/list-services.dto';
import { CreatePublicationVersionDto } from './dto/create-publication-version.dto';
import { CreateServiceCoverageDto } from './dto/create-service-coverage.dto';
import { CreateServiceEvidenceTypeDto } from './dto/create-service-evidence-type.dto';
import { CreateServiceRequirementDto } from './dto/create-service-requirement.dto';
import { CreateServiceSlaDto } from './dto/create-service-sla.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('catalog/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  listPublished(@Query() query: ListServicesDto) {
    return this.servicesService.listPublishedServices(query, query.categoryId);
  }

  // Literal antes de ':id' — si no, ':id' capturaría 'evidence-types'.
  @Public()
  @Get('evidence-types')
  listEvidenceTypes() {
    return this.servicesService.listEvidenceTypes();
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'create')
  @Post('evidence-types')
  createEvidenceType(@Body() dto: CreateServiceEvidenceTypeDto) {
    return this.servicesService.createEvidenceType(dto);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'create')
  @Post('requirements')
  createRequirement(@Body() dto: CreateServiceRequirementDto) {
    return this.servicesService.createRequirement(dto);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'create')
  @Post('sla')
  createSla(@Body() dto: CreateServiceSlaDto) {
    return this.servicesService.createSla(dto);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'create')
  @Post('coverage')
  createCoverage(@Body() dto: CreateServiceCoverageDto) {
    return this.servicesService.createCoverage(dto);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'write')
  @Post('publication-versions/:versionId/publish')
  publishVersion(
    @Param('versionId', ParseIntPipe) versionId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.servicesService.publishVersion(versionId, user.id);
  }

  @Public()
  @Get(':id')
  getPublished(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getPublishedService(id);
  }

  @Public()
  @Get(':id/sla')
  listSla(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.listSla(id);
  }

  @Public()
  @Get(':id/coverage')
  listCoverage(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.listCoverage(id);
  }

  @Public()
  @Get(':id/requirements')
  listRequirements(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.listRequirements(id);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'read')
  @Get(':id/publication')
  getPublicationStatus(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getPublicationStatus(id);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'read')
  @Get(':id/publication/versions')
  listPublicationVersions(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.listPublicationVersions(id);
  }

  @RequirePermission(ModelName.SERVICE_PUBLICATION, 'create')
  @Post(':id/publication/versions')
  createPublicationVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePublicationVersionDto,
  ) {
    return this.servicesService.createPublicationVersion(id, dto);
  }
}
