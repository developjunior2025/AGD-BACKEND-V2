import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ModaiInspectionResult } from '../entities/sidunea-modai-inspection.entity';

export class UpdateModaiInspectionDto {
  @IsEnum(ModaiInspectionResult)
  result: ModaiInspectionResult;

  @IsOptional()
  @IsString()
  notes?: string;
}
