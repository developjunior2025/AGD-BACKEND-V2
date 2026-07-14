import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class DuaItemInputDto {
  @IsString()
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tariffCode?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumberString()
  value: string;
}

export class CreateDuaDto {
  @IsInt()
  caseId: number;

  @IsString()
  @MaxLength(64)
  duaNumber: string;

  @IsOptional()
  @IsInt()
  customsDeclarationId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DuaItemInputDto)
  items?: DuaItemInputDto[];
}
