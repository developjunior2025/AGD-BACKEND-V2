import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { CargoHandlingTaskType } from '../entities/cargo-handling-task.entity';

export class CreateCargoHandlingTaskDto {
  @IsInt()
  caseId: number;

  @IsEnum(CargoHandlingTaskType)
  taskType: CargoHandlingTaskType;

  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
