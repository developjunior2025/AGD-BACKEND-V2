import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { AgdConfigModule } from '../config/config.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { AccountMoveLine } from './entities/account-move-line.entity';
import { AccountMove } from './entities/account-move.entity';
import { AccountPayment } from './entities/account-payment.entity';

const ENTITIES = [AccountMove, AccountMoveLine, AccountPayment];

@Module({
  imports: [
    IdentityModule,
    AgdConfigModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [TypeOrmModule.forFeature(ENTITIES), BillingService],
})
export class BillingModule {}
