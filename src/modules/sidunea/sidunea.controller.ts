import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateDuaDto } from './dto/create-dua.dto';
import { CreateModcarManifestDto } from './dto/create-modcar-manifest.dto';
import { CreateModshdExitPassDto } from './dto/create-modshd-exit-pass.dto';
import { SidUneaService } from './sidunea.service';

/**
 * Endpoints de carga administrativa del espejo SIDUNEA. Son un contrato
 * mínimo para que el perfil Consultor (Fase 4) tenga algo que consultar;
 * Fase 6 (agente de aduanas) y Fase 8 (TOS) reemplazan esto por los
 * flujos reales de declaración/manifiesto.
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
}
