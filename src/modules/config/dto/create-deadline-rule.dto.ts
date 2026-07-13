import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateDeadlineRuleDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  daysToDeadline: number;
}
