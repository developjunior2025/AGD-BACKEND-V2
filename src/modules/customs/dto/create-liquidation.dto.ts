import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateLiquidationDto {
  @IsNumberString()
  totalTaxes: string;

  @IsOptional()
  @IsNumberString()
  totalDuties?: string;

  @IsInt()
  currencyId: number;

  @IsOptional()
  @IsString()
  details?: string;
}
