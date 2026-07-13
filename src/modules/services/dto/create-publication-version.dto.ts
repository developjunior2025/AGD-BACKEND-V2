import { IsString } from 'class-validator';

export class CreatePublicationVersionDto {
  @IsString()
  content: string;
}
