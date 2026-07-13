import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTariffRuleDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  currencyId?: number;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsNumberString()
  percentage?: string;
}
