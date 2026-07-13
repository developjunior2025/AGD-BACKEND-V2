import { IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  subject: string;

  @IsString()
  description: string;
}
