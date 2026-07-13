import { IsString } from 'class-validator';

export class CreatePolicyVersionDto {
  @IsString()
  versionLabel: string;

  @IsString()
  content: string;
}
