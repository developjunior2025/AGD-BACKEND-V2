import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CasesModule } from './modules/cases/cases.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AgdConfigModule } from './modules/config/config.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EnablementModule } from './modules/enablement/enablement.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { HealthModule } from './modules/health/health.module';
import { HomeModule } from './modules/home/home.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ServicesModule } from './modules/services/services.module';
import { SidUneaModule } from './modules/sidunea/sidunea.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    DatabaseModule,
    HealthModule,
    IdentityModule,
    AuthModule,
    UsersModule,
    EnablementModule,
    AgdConfigModule,
    DocumentsModule,
    GovernanceModule,
    SidUneaModule,
    CasesModule,
    HomeModule,
    CatalogModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
