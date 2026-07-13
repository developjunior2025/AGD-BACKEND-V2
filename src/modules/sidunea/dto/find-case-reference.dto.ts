import { IsOptional, IsString } from 'class-validator';

/** Al menos una referencia debe venir informada (validado en el servicio). */
export class FindCaseReferenceDto {
  @IsOptional()
  @IsString()
  dua?: string;

  @IsOptional()
  @IsString()
  manifest?: string;

  @IsOptional()
  @IsString()
  exitPass?: string;
}
