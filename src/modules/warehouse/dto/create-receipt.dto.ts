import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReceiptLineInputDto {
  @IsInt()
  productTemplateId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  destLocationId: number;

  @IsOptional()
  @IsString()
  lotName?: string;
}

export class CreateReceiptDto {
  @IsInt()
  caseId: number;

  @IsString()
  manifestNumber: string;

  @IsOptional()
  @IsString()
  blNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptLineInputDto)
  lines: ReceiptLineInputDto[];
}
