import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateTaxSimulationDto {
  @IsInt()
  caseId: number;

  @IsNumberString()
  estimatedTaxes: string;

  @IsInt()
  currencyId: number;

  @IsOptional()
  @IsString()
  breakdown?: string;
}
