import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SidUneaDua } from './entities/sidunea-dua.entity';
import { SidUneaMirrorRecord } from './entities/sidunea-mirror-record.entity';
import { SidUneaModcarManifest } from './entities/sidunea-modcar-manifest.entity';
import { SidUneaModshdExitPass } from './entities/sidunea-modshd-exit-pass.entity';
import { SidUneaController } from './sidunea.controller';
import { SidUneaService } from './sidunea.service';

const ENTITIES = [
  SidUneaMirrorRecord,
  SidUneaDua,
  SidUneaModcarManifest,
  SidUneaModshdExitPass,
];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  controllers: [SidUneaController],
  providers: [SidUneaService],
  exports: [TypeOrmModule.forFeature(ENTITIES), SidUneaService],
})
export class SidUneaModule {}
