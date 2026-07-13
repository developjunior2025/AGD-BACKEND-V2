import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  resModel: string;

  @IsInt()
  resId: number;

  @IsOptional()
  @IsInt()
  ratedByPartnerId?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
