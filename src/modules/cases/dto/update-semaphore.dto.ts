import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SemaphoreColor } from '../entities/case-semaphore.entity';

export class UpdateSemaphoreDto {
  @IsEnum(SemaphoreColor)
  color: SemaphoreColor;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
