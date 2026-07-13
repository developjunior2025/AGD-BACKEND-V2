import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActivityDecision } from '../entities/activity.entity';

export class CompleteActivityDto {
  @IsOptional()
  @IsEnum(ActivityDecision)
  decision?: ActivityDecision;

  @IsOptional()
  @IsString()
  notes?: string;
}
