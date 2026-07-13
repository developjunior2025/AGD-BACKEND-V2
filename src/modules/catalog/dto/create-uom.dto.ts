import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUomCategoryDto {
  @IsString()
  @MaxLength(64)
  name: string;
}

export class CreateUomDto {
  @IsString()
  @MaxLength(32)
  name: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsNumberString()
  factor?: string;
}
