import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { CurrencyRate } from './entities/currency-rate.entity';
import { Currency } from './entities/currency.entity';
import { DeadlineRule } from './entities/deadline-rule.entity';
import { ExternalIntegrationReference } from './entities/external-integration-reference.entity';
import { MailTemplate } from './entities/mail-template.entity';
import { Sequence } from './entities/sequence.entity';
import { SlaRule } from './entities/sla-rule.entity';
import { TariffRule } from './entities/tariff-rule.entity';
import { Tax } from './entities/tax.entity';
import { SequenceService } from './sequence.service';

const ENTITIES = [
  Currency,
  CurrencyRate,
  Tax,
  MailTemplate,
  TariffRule,
  SlaRule,
  DeadlineRule,
  ExternalIntegrationReference,
  Sequence,
];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  controllers: [ConfigController],
  providers: [ConfigService, SequenceService],
  exports: [TypeOrmModule.forFeature(ENTITIES), SequenceService],
})
export class AgdConfigModule {}
