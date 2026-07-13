import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module';
import { AgdConfigModule } from '../config/config.module';
import { DocumentsModule } from '../documents/documents.module';
import { ServiceCoverage } from './entities/service-coverage.entity';
import { ServiceEvidenceType } from './entities/service-evidence-type.entity';
import { ServicePublicationVersion } from './entities/service-publication-version.entity';
import { ServicePublication } from './entities/service-publication.entity';
import { ServiceRequirement } from './entities/service-requirement.entity';
import { ServiceSla } from './entities/service-sla.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

const ENTITIES = [
  ServiceRequirement,
  ServiceSla,
  ServiceCoverage,
  ServiceEvidenceType,
  ServicePublication,
  ServicePublicationVersion,
];

@Module({
  imports: [
    CatalogModule,
    AgdConfigModule,
    DocumentsModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [TypeOrmModule.forFeature(ENTITIES), ServicesService],
})
export class ServicesModule {}
