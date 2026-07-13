import { IsDateString, IsInt, IsNumberString } from 'class-validator';

export class CreateCurrencyRateDto {
  @IsInt()
  currencyId: number;

  @IsDateString()
  rateDate: string;

  @IsNumberString()
  rate: string;
}
