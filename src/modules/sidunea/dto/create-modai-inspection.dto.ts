import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateModaiInspectionDto {
  @IsInt()
  caseId: number;

  @IsString()
  @MaxLength(64)
  inspectionNumber: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
