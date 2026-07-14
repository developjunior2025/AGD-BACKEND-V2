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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { AddDeclarationItemDto } from './dto/add-declaration-item.dto';
import { AssignRegimeDto } from './dto/assign-regime.dto';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { CreateLiquidationDto } from './dto/create-liquidation.dto';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CustomsService } from './customs.service';

@ApiTags('customs')
@Controller('customs')
export class CustomsController {
  constructor(private readonly customsService: CustomsService) {}

  @RequirePermission(ModelName.CUSTOMS_LICENSE, 'write')
  @Post('agents/:partnerId/license')
  verifyLicense(
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @Body() dto: VerifyLicenseDto,
  ) {
    return this.customsService.verifyLicense(partnerId, dto);
  }

  @RequirePermission(ModelName.CUSTOMS_LICENSE, 'read')
  @Get('agents/:partnerId/license')
  getLicense(@Param('partnerId', ParseIntPipe) partnerId: number) {
    return this.customsService.getLicense(partnerId);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'create')
  @Post('declarations')
  createDeclaration(
    @Body() dto: CreateDeclarationDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.createDeclaration(dto, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'read')
  @Get('declarations')
  listMine(
    @CurrentUser() actor: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.customsService.listMyDeclarations(actor, query);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'read')
  @Get('declarations/:id')
  get(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.getDeclarationForActor(id, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'write')
  @Post('declarations/:id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddDeclarationItemDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.addItem(id, dto, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'read')
  @Get('declarations/:id/items')
  listItems(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.listItems(id, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'write')
  @Post('declarations/:id/regime')
  assignRegime(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRegimeDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.assignRegime(id, dto, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'read')
  @Get('declarations/:id/regime')
  getRegime(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.getRegimeAssignment(id, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'write')
  @Post('declarations/:id/tax-liquidation')
  createLiquidation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLiquidationDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.createLiquidation(id, dto, actor);
  }

  @RequirePermission(ModelName.CUSTOMS_DECLARATION, 'read')
  @Get('declarations/:id/tax-liquidation')
  getLiquidation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.customsService.getLiquidation(id, actor);
  }
}
