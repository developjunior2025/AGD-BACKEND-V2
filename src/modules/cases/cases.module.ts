import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgdConfigModule } from '../config/config.module';
import { DocumentsModule } from '../documents/documents.module';
import { GovernanceModule } from '../governance/governance.module';
import { IdentityModule } from '../identity/identity.module';
import { SidUneaModule } from '../sidunea/sidunea.module';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CaseParty } from './entities/case-party.entity';
import { CaseSemaphore } from './entities/case-semaphore.entity';
import { Case } from './entities/case.entity';

const ENTITIES = [Case, CaseParty, CaseSemaphore];

@Module({
  imports: [
    IdentityModule,
    AgdConfigModule,
    DocumentsModule,
    GovernanceModule,
    SidUneaModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [TypeOrmModule.forFeature(ENTITIES), CasesService],
})
export class CasesModule {}
