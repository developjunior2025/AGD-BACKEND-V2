import { IsString, Length, MaxLength } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @Length(3, 3)
  code: string;

  @IsString()
  @MaxLength(64)
  name: string;

  @IsString()
  @MaxLength(8)
  symbol: string;
}
