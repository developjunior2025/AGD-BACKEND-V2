import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgdConfigModule } from '../config/config.module';
import { SidUneaModule } from '../sidunea/sidunea.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { CargoHandlingTask } from './entities/cargo-handling-task.entity';
import { ConsolidationOrder } from './entities/consolidation-order.entity';
import { CustodyRecord } from './entities/custody-record.entity';
import { DeconsolidationOrder } from './entities/deconsolidation-order.entity';
import { DiscrepancyItem } from './entities/discrepancy-item.entity';
import { DiscrepancyMatrix } from './entities/discrepancy-matrix.entity';
import { ReceiptDiscrepancy } from './entities/receipt-discrepancy.entity';
import { StoragePeriod } from './entities/storage-period.entity';
import { WeighingTicket } from './entities/weighing-ticket.entity';
import { WmsController } from './wms.controller';
import { WmsService } from './wms.service';

const ENTITIES = [
  ReceiptDiscrepancy,
  CustodyRecord,
  StoragePeriod,
  WeighingTicket,
  ConsolidationOrder,
  DeconsolidationOrder,
  CargoHandlingTask,
  DiscrepancyMatrix,
  DiscrepancyItem,
];

@Module({
  imports: [
    AgdConfigModule,
    WarehouseModule,
    SidUneaModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [WmsController],
  providers: [WmsService],
  exports: [TypeOrmModule.forFeature(ENTITIES), WmsService],
})
export class WmsModule {}
