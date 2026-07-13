import { IsEnum } from 'class-validator';
import { HelpdeskTicketStatus } from '../entities/helpdesk-ticket.entity';

export class UpdateTicketStatusDto {
  @IsEnum(HelpdeskTicketStatus)
  status: HelpdeskTicketStatus;
}
