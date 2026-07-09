import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EnablementModule } from './modules/enablement/enablement.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
