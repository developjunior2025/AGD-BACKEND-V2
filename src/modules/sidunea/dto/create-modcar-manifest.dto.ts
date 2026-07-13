import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateModcarManifestDto {
  @IsInt()
  caseId: number;

  @IsString()
  @MaxLength(64)
  manifestNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  carrierName?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;
}
