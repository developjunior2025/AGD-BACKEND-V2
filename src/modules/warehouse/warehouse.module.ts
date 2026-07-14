import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgdConfigModule } from '../config/config.module';
import { StockLocation } from './entities/stock-location.entity';
import { StockLot } from './entities/stock-lot.entity';
import { StockMoveLine } from './entities/stock-move-line.entity';
import { StockMove } from './entities/stock-move.entity';
import { StockPackageType } from './entities/stock-package-type.entity';
import { StockPickingType } from './entities/stock-picking-type.entity';
import { StockPicking } from './entities/stock-picking.entity';
import { StockQuantPackage } from './entities/stock-quant-package.entity';
import { StockQuant } from './entities/stock-quant.entity';
import { StockWarehouse } from './entities/stock-warehouse.entity';
import { WarehouseService } from './warehouse.service';

const ENTITIES = [
  StockWarehouse,
  StockLocation,
  StockPickingType,
  StockPicking,
  StockMove,
  StockMoveLine,
  StockQuant,
  StockLot,
  StockQuantPackage,
  StockPackageType,
];

@Module({
  imports: [AgdConfigModule, TypeOrmModule.forFeature(ENTITIES)],
  providers: [WarehouseService],
  exports: [TypeOrmModule.forFeature(ENTITIES), WarehouseService],
})
export class WarehouseModule {}
