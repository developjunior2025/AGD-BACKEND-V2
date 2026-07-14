import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateCustomsRegimeDto } from './dto/create-customs-regime.dto';
import { CreateDuaDto } from './dto/create-dua.dto';
import { CreateModaiInspectionDto } from './dto/create-modai-inspection.dto';
import { CreateModcarManifestDto } from './dto/create-modcar-manifest.dto';
import { CreateModshdExitPassDto } from './dto/create-modshd-exit-pass.dto';
import { CreateTaxSimulationDto } from './dto/create-tax-simulation.dto';
import { UpdateModaiInspectionDto } from './dto/update-modai-inspection.dto';
import { SidUneaService } from './sidunea.service';

/**
 * Contrato del espejo SIDUNEA. El Consultor (Fase 4) solo lee; el agente de
 * aduanas (Fase 6) y el operador TOS (Fase 8) son quienes efectivamente
 * cargan estos registros — sin integración electrónica real con el sistema
 * oficial.
 */
@ApiTags('sidunea')
@Controller('sidunea')
export class SidUneaController {
  constructor(private readonly sidUneaService: SidUneaService) {}

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('dua')
  createDua(@Body() dto: CreateDuaDto) {
    return this.sidUneaService.createDua(dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'read')
  @Get('dua/:id')
  getDua(@Param('id', ParseIntPipe) id: number) {
    return this.sidUneaService.getDua(id);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('modcar-manifest')
  createManifest(@Body() dto: CreateModcarManifestDto) {
    return this.sidUneaService.createManifest(dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('modshd-exit-pass')
  createExitPass(@Body() dto: CreateModshdExitPassDto) {
    return this.sidUneaService.createExitPass(dto);
  }

  @Get('customs-regimes')
  listCustomsRegimes() {
    return this.sidUneaService.listCustomsRegimes();
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('customs-regimes')
  createCustomsRegime(@Body() dto: CreateCustomsRegimeDto) {
    return this.sidUneaService.createCustomsRegime(dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('modai')
  createModaiInspection(@Body() dto: CreateModaiInspectionDto) {
    return this.sidUneaService.createModaiInspection(dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'read')
  @Get('modai')
  listModaiInspections(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.sidUneaService.listModaiInspections(caseId);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'write')
  @Patch('modai/:id')
  updateModaiInspection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModaiInspectionDto,
  ) {
    return this.sidUneaService.updateModaiInspection(id, dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'create')
  @Post('tax-simulation')
  createTaxSimulation(@Body() dto: CreateTaxSimulationDto) {
    return this.sidUneaService.createTaxSimulation(dto);
  }

  @RequirePermission(ModelName.SIDUNEA_MIRROR, 'read')
  @Get('tax-simulation')
  listTaxSimulations(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.sidUneaService.listTaxSimulations(caseId);
  }
}
