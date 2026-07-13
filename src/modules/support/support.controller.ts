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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: RequestUser) {
    return this.supportService.createTicket(user.partnerId, dto);
  }

  // Literal antes de un futuro ':id' — evita que capture 'me'.
  @Get('me')
  listMine(
    @CurrentUser() user: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.supportService.listMyTickets(user.partnerId, query);
  }

  @RequirePermission(ModelName.HELPDESK, 'read')
  @Get()
  listAll(@Query() query: PaginationQueryDto) {
    return this.supportService.listAllTickets(query);
  }

  @RequirePermission(ModelName.HELPDESK, 'write')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateStatus(id, dto);
  }
}
