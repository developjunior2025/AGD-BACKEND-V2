import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGovernanceWorkflowDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  approverGroupId: number;
}
