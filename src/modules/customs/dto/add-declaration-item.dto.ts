import {
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddDeclarationItemDto {
  @IsString()
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tariffCode?: string;

  @IsNumberString()
  quantity: string;

  @IsNumberString()
  unitValue: string;
}
