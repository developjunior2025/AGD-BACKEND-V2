import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  color?: string;
}
