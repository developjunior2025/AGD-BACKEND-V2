import { IsString, MaxLength } from 'class-validator';

export class CreateMailTemplateDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsString()
  @MaxLength(255)
  subject: string;

  @IsString()
  body: string;
}
