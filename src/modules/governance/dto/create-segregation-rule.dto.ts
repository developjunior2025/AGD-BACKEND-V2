import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSegregationRuleDto {
  @IsInt()
  groupAId: number;

  @IsInt()
  groupBId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
