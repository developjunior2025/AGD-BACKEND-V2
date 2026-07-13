import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CreateCurrencyRateDto } from './dto/create-currency-rate.dto';
import { CreateDeadlineRuleDto } from './dto/create-deadline-rule.dto';
import { CreateExternalIntegrationReferenceDto } from './dto/create-external-integration-reference.dto';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { CreateSlaRuleDto } from './dto/create-sla-rule.dto';
import { CreateTariffRuleDto } from './dto/create-tariff-rule.dto';
import { CreateTaxDto } from './dto/create-tax.dto';
import { Currency } from './entities/currency.entity';
import { CurrencyRate } from './entities/currency-rate.entity';
import { DeadlineRule } from './entities/deadline-rule.entity';
import { ExternalIntegrationReference } from './entities/external-integration-reference.entity';
import { MailTemplate } from './entities/mail-template.entity';
import { SlaRule } from './entities/sla-rule.entity';
import { TariffRule } from './entities/tariff-rule.entity';
import { Tax } from './entities/tax.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(CurrencyRate)
    private readonly currencyRateRepository: Repository<CurrencyRate>,
    @InjectRepository(Tax) private readonly taxRepository: Repository<Tax>,
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
    @InjectRepository(TariffRule)
    private readonly tariffRuleRepository: Repository<TariffRule>,
    @InjectRepository(SlaRule)
    private readonly slaRuleRepository: Repository<SlaRule>,
    @InjectRepository(DeadlineRule)
    private readonly deadlineRuleRepository: Repository<DeadlineRule>,
    @InjectRepository(ExternalIntegrationReference)
    private readonly externalIntegrationRepository: Repository<ExternalIntegrationReference>,
  ) {}

  listCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.find({ where: { active: true } });
  }

  createCurrency(dto: CreateCurrencyDto): Promise<Currency> {
    return this.currencyRepository.save(this.currencyRepository.create(dto));
  }

  listCurrencyRates(currencyId?: number): Promise<CurrencyRate[]> {
    return this.currencyRateRepository.find({
      where: currencyId ? { currencyId } : {},
      order: { rateDate: 'DESC' },
    });
  }

  createCurrencyRate(dto: CreateCurrencyRateDto): Promise<CurrencyRate> {
    return this.currencyRateRepository.save(
      this.currencyRateRepository.create(dto),
    );
  }

  listTaxes(): Promise<Tax[]> {
    return this.taxRepository.find({ where: { active: true } });
  }

  createTax(dto: CreateTaxDto): Promise<Tax> {
    return this.taxRepository.save(this.taxRepository.create(dto));
  }

  listMailTemplates(): Promise<MailTemplate[]> {
    return this.mailTemplateRepository.find({ where: { active: true } });
  }

  createMailTemplate(dto: CreateMailTemplateDto): Promise<MailTemplate> {
    return this.mailTemplateRepository.save(
      this.mailTemplateRepository.create(dto),
    );
  }

  listTariffRules(): Promise<TariffRule[]> {
    return this.tariffRuleRepository.find({ where: { active: true } });
  }

  createTariffRule(dto: CreateTariffRuleDto): Promise<TariffRule> {
    return this.tariffRuleRepository.save(
      this.tariffRuleRepository.create(dto),
    );
  }

  listSlaRules(): Promise<SlaRule[]> {
    return this.slaRuleRepository.find({ where: { active: true } });
  }

  createSlaRule(dto: CreateSlaRuleDto): Promise<SlaRule> {
    return this.slaRuleRepository.save(this.slaRuleRepository.create(dto));
  }

  listDeadlineRules(): Promise<DeadlineRule[]> {
    return this.deadlineRuleRepository.find({ where: { active: true } });
  }

  createDeadlineRule(dto: CreateDeadlineRuleDto): Promise<DeadlineRule> {
    return this.deadlineRuleRepository.save(
      this.deadlineRuleRepository.create(dto),
    );
  }

  listExternalIntegrations(): Promise<ExternalIntegrationReference[]> {
    return this.externalIntegrationRepository.find({ where: { active: true } });
  }

  createExternalIntegration(
    dto: CreateExternalIntegrationReferenceDto,
  ): Promise<ExternalIntegrationReference> {
    return this.externalIntegrationRepository.save(
      this.externalIntegrationRepository.create(dto),
    );
  }
}
