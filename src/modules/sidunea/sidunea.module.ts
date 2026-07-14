import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgdConfigModule } from '../config/config.module';
import { SidUneaCustomsRegime } from './entities/sidunea-customs-regime.entity';
import { SidUneaDuaItem } from './entities/sidunea-dua-item.entity';
import { SidUneaDua } from './entities/sidunea-dua.entity';
import { SidUneaMirrorRecord } from './entities/sidunea-mirror-record.entity';
import { SidUneaModaiInspection } from './entities/sidunea-modai-inspection.entity';
import { SidUneaModcarManifest } from './entities/sidunea-modcar-manifest.entity';
import { SidUneaModshdExitPass } from './entities/sidunea-modshd-exit-pass.entity';
import { SidUneaTaxSimulation } from './entities/sidunea-tax-simulation.entity';
import { SidUneaController } from './sidunea.controller';
import { SidUneaService } from './sidunea.service';

const ENTITIES = [
  SidUneaMirrorRecord,
  SidUneaDua,
  SidUneaDuaItem,
  SidUneaModcarManifest,
  SidUneaModshdExitPass,
  SidUneaCustomsRegime,
  SidUneaModaiInspection,
  SidUneaTaxSimulation,
];

@Module({
  imports: [AgdConfigModule, TypeOrmModule.forFeature(ENTITIES)],
  controllers: [SidUneaController],
  providers: [SidUneaService],
  exports: [TypeOrmModule.forFeature(ENTITIES), SidUneaService],
})
export class SidUneaModule {}
