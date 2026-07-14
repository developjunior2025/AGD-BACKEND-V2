import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyLicenseDto {
  @IsString()
  @MaxLength(64)
  licenseNumber: string;

  @IsDateString()
  issuedAt: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
