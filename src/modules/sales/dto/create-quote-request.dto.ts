import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class QuoteRequestLineInputDto {
  @IsOptional()
  @IsInt()
  productTemplateId?: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuoteRequestDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteRequestLineInputDto)
  lines: QuoteRequestLineInputDto[];
}
