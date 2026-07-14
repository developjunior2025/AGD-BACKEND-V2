import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesModule } from '../cases/cases.module';
import { AgdConfigModule } from '../config/config.module';
import { IdentityModule } from '../identity/identity.module';
import { SidUneaModule } from '../sidunea/sidunea.module';
import { CustomsController } from './customs.controller';
import { CustomsService } from './customs.service';
import { CustomsDeclarationItem } from './entities/customs-declaration-item.entity';
import { CustomsDeclaration } from './entities/customs-declaration.entity';
import { CustomsLicense } from './entities/customs-license.entity';
import { CustomsRegimeAssignment } from './entities/customs-regime-assignment.entity';
import { CustomsTaxLiquidation } from './entities/customs-tax-liquidation.entity';

const ENTITIES = [
  CustomsLicense,
  CustomsDeclaration,
  CustomsDeclarationItem,
  CustomsRegimeAssignment,
  CustomsTaxLiquidation,
];

@Module({
  imports: [
    IdentityModule,
    AgdConfigModule,
    CasesModule,
    SidUneaModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [CustomsController],
  providers: [CustomsService],
  exports: [TypeOrmModule.forFeature(ENTITIES), CustomsService],
})
export class CustomsModule {}
