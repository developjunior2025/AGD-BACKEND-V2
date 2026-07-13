import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ConfigService } from './config.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CreateCurrencyRateDto } from './dto/create-currency-rate.dto';
import { CreateDeadlineRuleDto } from './dto/create-deadline-rule.dto';
import { CreateExternalIntegrationReferenceDto } from './dto/create-external-integration-reference.dto';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { CreateSlaRuleDto } from './dto/create-sla-rule.dto';
import { CreateTariffRuleDto } from './dto/create-tariff-rule.dto';
import { CreateTaxDto } from './dto/create-tax.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('currencies')
  listCurrencies() {
    return this.configService.listCurrencies();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('currencies')
  createCurrency(@Body() dto: CreateCurrencyDto) {
    return this.configService.createCurrency(dto);
  }

  @Get('currency-rates')
  listCurrencyRates(@Query('currencyId') currencyId?: string) {
    return this.configService.listCurrencyRates(
      currencyId ? Number(currencyId) : undefined,
    );
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('currency-rates')
  createCurrencyRate(@Body() dto: CreateCurrencyRateDto) {
    return this.configService.createCurrencyRate(dto);
  }

  @Get('taxes')
  listTaxes() {
    return this.configService.listTaxes();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('taxes')
  createTax(@Body() dto: CreateTaxDto) {
    return this.configService.createTax(dto);
  }

  @RequirePermission(ModelName.CONFIG, 'read')
  @Get('mail-templates')
  listMailTemplates() {
    return this.configService.listMailTemplates();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('mail-templates')
  createMailTemplate(@Body() dto: CreateMailTemplateDto) {
    return this.configService.createMailTemplate(dto);
  }

  @Get('tariff-rules')
  listTariffRules() {
    return this.configService.listTariffRules();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('tariff-rules')
  createTariffRule(@Body() dto: CreateTariffRuleDto) {
    return this.configService.createTariffRule(dto);
  }

  @Get('sla-rules')
  listSlaRules() {
    return this.configService.listSlaRules();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('sla-rules')
  createSlaRule(@Body() dto: CreateSlaRuleDto) {
    return this.configService.createSlaRule(dto);
  }

  @Get('deadline-rules')
  listDeadlineRules() {
    return this.configService.listDeadlineRules();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('deadline-rules')
  createDeadlineRule(@Body() dto: CreateDeadlineRuleDto) {
    return this.configService.createDeadlineRule(dto);
  }

  @Get('external-integrations')
  listExternalIntegrations() {
    return this.configService.listExternalIntegrations();
  }

  @RequirePermission(ModelName.CONFIG, 'create')
  @Post('external-integrations')
  createExternalIntegration(
    @Body() dto: CreateExternalIntegrationReferenceDto,
  ) {
    return this.configService.createExternalIntegration(dto);
  }
}
