import { IsOptional, IsString } from 'class-validator';

export class CreatePortalVersionDto {
  @IsString()
  versionLabel: string;

  @IsOptional()
  @IsString()
  releaseNotes?: string;
}
