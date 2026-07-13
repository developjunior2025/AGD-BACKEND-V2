import { IsOptional, IsString } from 'class-validator';

export class TrackVisitDto {
  @IsOptional()
  @IsString()
  sessionToken?: string;

  @IsString()
  url: string;
}
