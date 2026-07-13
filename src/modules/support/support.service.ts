import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import {
  HelpdeskTicket,
  HelpdeskTicketStatus,
} from './entities/helpdesk-ticket.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(HelpdeskTicket)
    private readonly ticketRepository: Repository<HelpdeskTicket>,
  ) {}

  createTicket(
    partnerId: number,
    dto: CreateTicketDto,
  ): Promise<HelpdeskTicket> {
    return this.ticketRepository.save(
      this.ticketRepository.create({ partnerId, ...dto }),
    );
  }

  async listMyTickets(
    partnerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HelpdeskTicket>> {
    const [data, total] = await this.ticketRepository.findAndCount({
      where: { partnerId },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async listAllTickets(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HelpdeskTicket>> {
    const [data, total] = await this.ticketRepository.findAndCount({
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async updateStatus(
    id: number,
    dto: UpdateTicketStatusDto,
  ): Promise<HelpdeskTicket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    ticket.status = dto.status;
    ticket.resolvedAt =
      dto.status === HelpdeskTicketStatus.RESOLVED ||
      dto.status === HelpdeskTicketStatus.CLOSED
        ? new Date()
        : null;
    return this.ticketRepository.save(ticket);
  }
}
