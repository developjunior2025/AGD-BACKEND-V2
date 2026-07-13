import { IsNumberString, IsString, MaxLength } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  @MaxLength(32)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsNumberString()
  percentage: string;
}
