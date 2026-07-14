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
import { CreatePickingOrderDto } from '../warehouse/dto/create-picking-order.dto';
import { CreateReceiptDto } from '../warehouse/dto/create-receipt.dto';
import { AddDiscrepancyItemDto } from './dto/add-discrepancy-item.dto';
import { CreateCargoHandlingTaskDto } from './dto/create-cargo-handling-task.dto';
import { CreateConsolidationOrderDto } from './dto/create-consolidation-order.dto';
import { CreateReceiptDiscrepancyDto } from './dto/create-receipt-discrepancy.dto';
import { CreateWeighingTicketDto } from './dto/create-weighing-ticket.dto';
import { WmsService } from './wms.service';

/**
 * Endpoints operativos de depósito (WMS) del operador AGD (Fase 8) y del
 * agente de aduanas (Fase 6) sobre expedientes ya registrados en SIDUNEA.
 */
@ApiTags('wms')
@Controller('wms')
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  @RequirePermission(ModelName.WMS, 'create')
  @Post('receipts')
  createReceipt(@Body() dto: CreateReceiptDto) {
    return this.wmsService.createReceipt(dto);
  }

  @RequirePermission(ModelName.WMS, 'read')
  @Get('inventory')
  getInventory(
    @Query('caseId') caseId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.wmsService.getInventory(
      caseId ? Number(caseId) : undefined,
      locationId ? Number(locationId) : undefined,
    );
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('picking-orders')
  createPickingOrder(@Body() dto: CreatePickingOrderDto) {
    return this.wmsService.createPickingOrder(dto);
  }

  @RequirePermission(ModelName.WMS, 'read')
  @Get('custody-records')
  listCustodyRecords(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.wmsService.listCustodyRecords(caseId);
  }

  @RequirePermission(ModelName.WMS, 'read')
  @Get('storage-periods')
  listStoragePeriods(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.wmsService.listStoragePeriods(caseId);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('weighing-tickets')
  createWeighingTicket(@Body() dto: CreateWeighingTicketDto) {
    return this.wmsService.createWeighingTicket(dto);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('consolidation-orders')
  createConsolidationOrder(@Body() dto: CreateConsolidationOrderDto) {
    return this.wmsService.createConsolidationOrder(dto);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('deconsolidation-orders')
  createDeconsolidationOrder(@Body() dto: CreateConsolidationOrderDto) {
    return this.wmsService.createDeconsolidationOrder(dto);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('cargo-handling-tasks')
  createCargoHandlingTask(@Body() dto: CreateCargoHandlingTaskDto) {
    return this.wmsService.createCargoHandlingTask(dto);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('receipt-discrepancies')
  createReceiptDiscrepancy(@Body() dto: CreateReceiptDiscrepancyDto) {
    return this.wmsService.createReceiptDiscrepancy(dto);
  }

  @RequirePermission(ModelName.WMS, 'read')
  @Get('discrepancy-matrix')
  getDiscrepancyMatrix(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.wmsService.getDiscrepancyMatrix(caseId);
  }

  @RequirePermission(ModelName.WMS, 'create')
  @Post('discrepancy-matrix/items')
  addDiscrepancyItem(@Body() dto: AddDiscrepancyItemDto) {
    return this.wmsService.addDiscrepancyItem(dto);
  }

  @RequirePermission(ModelName.WMS, 'write')
  @Patch('discrepancy-matrix/items/:id/resolve')
  resolveDiscrepancyItem(@Param('id', ParseIntPipe) id: number) {
    return this.wmsService.resolveDiscrepancyItem(id);
  }

  @RequirePermission(ModelName.WMS, 'write')
  @Patch('discrepancy-matrix/reconcile')
  reconcileMatrix(@Query('caseId', ParseIntPipe) caseId: number) {
    return this.wmsService.reconcileMatrix(caseId);
  }
}
