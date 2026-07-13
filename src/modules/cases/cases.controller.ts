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

  @RequirePermission(ModelName.CASE, 'read')
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.getCase(id);
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
