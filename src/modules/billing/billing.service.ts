import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AccountMoveLine } from './entities/account-move-line.entity';
import {
  AccountMove,
  AccountMoveState,
  AccountMoveType,
} from './entities/account-move.entity';
import {
  AccountPayment,
  AccountPaymentState,
} from './entities/account-payment.entity';

export interface InvoiceLineInput {
  description: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(AccountMove)
    private readonly accountMoveRepository: Repository<AccountMove>,
    @InjectRepository(AccountMoveLine)
    private readonly accountMoveLineRepository: Repository<AccountMoveLine>,
    @InjectRepository(AccountPayment)
    private readonly accountPaymentRepository: Repository<AccountPayment>,
  ) {}

  /** Usado por el checkout de Fase 5 para facturar una orden confirmada. */
  async createInvoice(
    partnerId: number,
    saleOrderId: number,
    currencyId: number,
    lines: InvoiceLineInput[],
  ): Promise<AccountMove> {
    const amountTotal = lines
      .reduce((sum, line) => sum + Number(line.subtotal), 0)
      .toFixed(2);

    const move = await this.accountMoveRepository.save(
      this.accountMoveRepository.create({
        partnerId,
        saleOrderId,
        moveType: AccountMoveType.OUT_INVOICE,
        state: AccountMoveState.POSTED,
        currencyId,
        amountTotal,
        invoiceDate: new Date().toISOString().slice(0, 10),
      }),
    );

    await this.accountMoveLineRepository.save(
      lines.map((line) =>
        this.accountMoveLineRepository.create({
          accountMoveId: move.id,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          subtotal: line.subtotal,
        }),
      ),
    );

    return move;
  }

  listInvoicesForOrder(saleOrderId: number): Promise<AccountMove[]> {
    return this.accountMoveRepository.find({
      where: { saleOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async listPaymentsForOrder(saleOrderId: number): Promise<AccountPayment[]> {
    const invoices = await this.accountMoveRepository.find({
      where: { saleOrderId },
    });
    if (invoices.length === 0) return [];
    return this.accountPaymentRepository.find({
      where: invoices.map((invoice) => ({ accountMoveId: invoice.id })),
      order: { paymentDate: 'DESC' },
    });
  }

  async createPayment(dto: CreatePaymentDto): Promise<AccountPayment> {
    const move = await this.accountMoveRepository.findOne({
      where: { id: dto.accountMoveId },
    });
    if (!move) throw new NotFoundException('Factura no encontrada');

    return this.accountPaymentRepository.save(
      this.accountPaymentRepository.create({
        accountMoveId: dto.accountMoveId,
        amount: dto.amount,
        method: dto.method ?? null,
        paymentDate: new Date(),
        state: AccountPaymentState.POSTED,
      }),
    );
  }
}
