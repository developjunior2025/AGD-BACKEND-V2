import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateDuaDto {
  @IsInt()
  caseId: number;

  @IsString()
  @MaxLength(64)
  duaNumber: string;
}
