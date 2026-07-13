import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateServiceRequirementDto {
  @IsInt()
  productTemplateId: number;

  @IsInt()
  documentRequirementId: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
}
