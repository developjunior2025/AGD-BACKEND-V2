import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomsRegimeDto {
  @IsString()
  @MaxLength(32)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
