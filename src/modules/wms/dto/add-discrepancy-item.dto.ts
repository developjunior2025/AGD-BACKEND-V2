import { IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

export class AddDiscrepancyItemDto {
  @IsInt()
  caseId: number;

  @IsOptional()
  @IsString()
  sidUneaReference?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumberString()
  quantityDifference?: string;
}
