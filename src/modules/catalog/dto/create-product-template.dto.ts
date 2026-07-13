import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductTemplateDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsInt()
  categoryId: number;

  @IsInt()
  uomId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  providerPartnerId?: number;
}
