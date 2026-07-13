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
import { CreateProviderQuoteDto } from './dto/create-provider-quote.dto';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { SelectQuoteDto } from './dto/select-quote.dto';
import { SalesService } from './sales.service';

@ApiTags('quotes')
@Controller('quotes/requests')
export class QuotesController {
  constructor(private readonly salesService: SalesService) {}

  @RequirePermission(ModelName.QUOTE_REQUEST, 'create')
  @Post()
  create(
    @Body() dto: CreateQuoteRequestDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.createQuoteRequest(actor.partnerId, dto);
  }

  @RequirePermission(ModelName.QUOTE_REQUEST, 'read')
  @Get()
  listMine(
    @CurrentUser() actor: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.salesService.listMyQuoteRequests(actor.partnerId, query);
  }

  // Se ofrece por separado del proveedor final (Fase 6/8 lo asumirán) —
  // por ahora lo emite un administrador en nombre del prestador.
  @RequirePermission(ModelName.ORDER, 'create')
  @Post('provider-quotes')
  submitProviderQuote(@Body() dto: CreateProviderQuoteDto) {
    return this.salesService.submitProviderQuote(dto);
  }

  @RequirePermission(ModelName.QUOTE_REQUEST, 'read')
  @Get(':id')
  get(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.getQuoteRequestForActor(id, actor);
  }

  @RequirePermission(ModelName.QUOTE_REQUEST, 'read')
  @Get(':id/comparison')
  getComparison(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.getComparisonForActor(id, actor);
  }

  @RequirePermission(ModelName.QUOTE_REQUEST, 'write')
  @Post(':id/select')
  select(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SelectQuoteDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.selectQuote(id, dto, actor);
  }
}
