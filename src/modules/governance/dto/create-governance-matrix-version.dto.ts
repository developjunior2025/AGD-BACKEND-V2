import { IsString } from 'class-validator';

export class CreateGovernanceMatrixVersionDto {
  @IsString()
  content: string;
}
