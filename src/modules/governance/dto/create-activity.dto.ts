import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @IsString()
  resModel: string;

  @IsInt()
  resId: number;

  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsString()
  @MaxLength(255)
  summary: string;

  @IsOptional()
  @IsInt()
  assignedToGroupId?: number;

  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
