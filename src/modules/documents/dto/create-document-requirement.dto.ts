import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDocumentRequirementDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
}
