import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateDocumentProfileMatrixDto {
  @IsInt()
  groupId: number;

  @IsInt()
  documentRequirementId: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
}
