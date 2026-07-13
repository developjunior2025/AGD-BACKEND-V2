import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateModshdExitPassDto {
  @IsInt()
  caseId: number;

  @IsString()
  @MaxLength(64)
  exitPassNumber: string;
}
