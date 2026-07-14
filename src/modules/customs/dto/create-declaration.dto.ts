import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDeclarationDto {
  @IsInt()
  caseId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
