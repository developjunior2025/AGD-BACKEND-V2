import { IsInt, IsString, Min, MaxLength } from 'class-validator';

export class CreateEscalationMatrixDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsInt()
  fromGroupId: number;

  @IsInt()
  toGroupId: number;

  @IsInt()
  @Min(1)
  afterHours: number;
}
