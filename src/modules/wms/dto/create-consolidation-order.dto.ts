import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateConsolidationOrderDto {
  @IsInt()
  caseId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
