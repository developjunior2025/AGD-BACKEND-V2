import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { FindCaseReferenceDto } from '../sidunea/dto/find-case-reference.dto';
import { AddCasePartyDto } from './dto/add-case-party.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { ListCasesDto } from './dto/list-cases.dto';
import { UpdateSemaphoreDto } from './dto/update-semaphore.dto';
import { CasesService } from './cases.service';

@ApiTags('cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @RequirePermission(ModelName.CASE, 'create')
  @Post()
  create(@Body() dto: CreateCaseDto) {
    return this.casesService.createCase(dto);
  }

  @RequirePermission(ModelName.CASE, 'read')
  @Get()
  list(@Query() query: ListCasesDto) {
    return this.casesService.listCases(query, query.ownerPartnerId);
  }

  // Literal antes de ':id' — si no, ':id' capturaría 'lookup'.
  @RequirePermission(ModelName.CASE_LOOKUP, 'read')
  @Get('lookup')
  lookup(
    @Query() query: FindCaseReferenceDto,
    @CurrentUser() actor: RequestUser,
    @Req() req: Request,
  ) {
    return this.casesService.lookupByReference(query, actor, req.ip ?? null);
  }

  @RequirePermission(ModelName.CASE, 'read')
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.getCase(id);
  }

  @RequirePermission(ModelName.CASE_LOOKUP, 'read')
  @Get(':id/tracking')
  getTracking(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
    @Req() req: Request,
  ) {
    return this.casesService.getTracking(id, actor, req.ip ?? null);
  }

  @RequirePermission(ModelName.CASE_LOOKUP, 'read')
  @Get(':id/documents')
  getCaseDocuments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
    @Req() req: Request,
  ) {
    return this.casesService.getCaseDocuments(id, actor, req.ip ?? null);
  }

  @RequirePermission(ModelName.CASE, 'read')
  @Get(':id/parties')
  listParties(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.listParties(id);
  }

  @RequirePermission(ModelName.CASE, 'write')
  @Post(':id/parties')
  addParty(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCasePartyDto,
  ) {
    return this.casesService.addParty(id, dto);
  }

  @RequirePermission(ModelName.CASE, 'read')
  @Get(':id/semaphore')
  getSemaphore(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.getSemaphore(id);
  }

  @RequirePermission(ModelName.CASE, 'write')
  @Patch(':id/semaphore')
  updateSemaphore(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSemaphoreDto,
  ) {
    return this.casesService.updateSemaphore(id, dto);
  }

  @RequirePermission(ModelName.CASE, 'read')
  @Get(':id/checklist')
  getChecklist(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.getChecklist(id);
  }

  @RequirePermission(ModelName.CASE, 'write')
  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.closeCase(id);
  }
}
