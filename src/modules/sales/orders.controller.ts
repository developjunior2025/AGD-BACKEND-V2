import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { SalesService } from './sales.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly salesService: SalesService) {}

  @RequirePermission(ModelName.ORDER, 'read')
  @Get()
  listMine(
    @CurrentUser() actor: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.salesService.listMyOrders(actor.partnerId, query);
  }

  @RequirePermission(ModelName.ORDER, 'read')
  @Get(':id')
  get(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.getOrder(id, actor);
  }

  @RequirePermission(ModelName.ORDER, 'read')
  @Get(':id/invoices')
  listInvoices(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.listOrderInvoices(id, actor);
  }

  @RequirePermission(ModelName.ORDER, 'read')
  @Get(':id/payments')
  listPayments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.salesService.listOrderPayments(id, actor);
  }
}
