import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
