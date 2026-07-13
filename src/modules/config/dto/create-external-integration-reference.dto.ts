import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateExternalIntegrationReferenceDto {
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
  @IsUrl()
  baseUrl?: string;
}
