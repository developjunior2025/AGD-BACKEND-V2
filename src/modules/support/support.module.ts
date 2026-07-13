import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { HelpdeskTicket } from './entities/helpdesk-ticket.entity';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [IdentityModule, TypeOrmModule.forFeature([HelpdeskTicket])],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [TypeOrmModule.forFeature([HelpdeskTicket]), SupportService],
})
export class SupportModule {}
