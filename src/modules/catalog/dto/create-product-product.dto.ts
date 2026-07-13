import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductProductDto {
  @IsInt()
  productTemplateId: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;
}
