import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AccountMove } from '../billing/entities/account-move.entity';
import { AccountPayment } from '../billing/entities/account-payment.entity';
import { BillingService } from '../billing/billing.service';
import { Case } from '../cases/entities/case.entity';
import { CasesService } from '../cases/cases.service';
import { CatalogService } from '../catalog/catalog.service';
import { Group } from '../identity/entities/group.entity';
import { RequestUser } from '../identity/interfaces/request-user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CreateProviderQuoteDto } from './dto/create-provider-quote.dto';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { SelectQuoteDto } from './dto/select-quote.dto';
import { QuoteComparison } from './entities/quote-comparison.entity';
import { QuoteRequestLine } from './entities/quote-request-line.entity';
import {
  QuoteRequest,
  QuoteRequestStatus,
} from './entities/quote-request.entity';
import { ServiceCartItem } from './entities/service-cart-item.entity';
import { ServiceCart, ServiceCartStatus } from './entities/service-cart.entity';
import {
  SaleOrder,
  SaleOrderState,
  SaleOrderType,
} from './entities/sale-order.entity';
import { SaleOrderLine } from './entities/sale-order-line.entity';

const IMPORTADOR_EXPORTADOR_GROUP_CODE = 'importador_exportador';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepository: Repository<QuoteRequest>,
    @InjectRepository(QuoteRequestLine)
    private readonly quoteRequestLineRepository: Repository<QuoteRequestLine>,
    @InjectRepository(QuoteComparison)
    private readonly quoteComparisonRepository: Repository<QuoteComparison>,
    @InjectRepository(SaleOrder)
    private readonly saleOrderRepository: Repository<SaleOrder>,
    @InjectRepository(SaleOrderLine)
    private readonly saleOrderLineRepository: Repository<SaleOrderLine>,
    @InjectRepository(ServiceCart)
    private readonly cartRepository: Repository<ServiceCart>,
    @InjectRepository(ServiceCartItem)
    private readonly cartItemRepository: Repository<ServiceCartItem>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly catalogService: CatalogService,
    private readonly casesService: CasesService,
    private readonly billingService: BillingService,
  ) {}

  // ---- Cotización multi-prestador -----------------------------------------

  async createQuoteRequest(
    requesterPartnerId: number,
    dto: CreateQuoteRequestDto,
  ): Promise<QuoteRequest> {
    const quoteRequest = await this.quoteRequestRepository.save(
      this.quoteRequestRepository.create({
        requesterPartnerId,
        categoryId: dto.categoryId ?? null,
        description: dto.description ?? null,
        status: QuoteRequestStatus.OPEN,
      }),
    );

    await this.quoteRequestLineRepository.save(
      dto.lines.map((line) =>
        this.quoteRequestLineRepository.create({
          quoteRequestId: quoteRequest.id,
          productTemplateId: line.productTemplateId ?? null,
          quantity: line.quantity,
          notes: line.notes ?? null,
        }),
      ),
    );

    return quoteRequest;
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest> {
    const found = await this.quoteRequestRepository.findOne({ where: { id } });
    if (!found)
      throw new NotFoundException('Solicitud de cotización no encontrada');
    return found;
  }

  async getQuoteRequestForActor(
    id: number,
    actor: RequestUser,
  ): Promise<QuoteRequest> {
    const found = await this.getQuoteRequest(id);
    this.assertOwnsPartner(found.requesterPartnerId, actor);
    return found;
  }

  async getComparisonForActor(
    quoteRequestId: number,
    actor: RequestUser,
  ): Promise<SaleOrder[]> {
    await this.getQuoteRequestForActor(quoteRequestId, actor);
    return this.getComparison(quoteRequestId);
  }

  async listMyQuoteRequests(
    requesterPartnerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<QuoteRequest>> {
    const [data, total] = await this.quoteRequestRepository.findAndCount({
      where: { requesterPartnerId },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  /** Un prestador (o admin en su nombre) presenta su cotización para la solicitud. */
  async submitProviderQuote(dto: CreateProviderQuoteDto): Promise<SaleOrder> {
    const quoteRequest = await this.getQuoteRequest(dto.quoteRequestId);
    if (quoteRequest.status !== QuoteRequestStatus.OPEN) {
      throw new BadRequestException(
        'La solicitud de cotización ya no admite nuevas ofertas',
      );
    }

    const lines = dto.lines.map((line) => ({
      ...line,
      subtotal: (Number(line.unitPrice) * line.quantity).toFixed(2),
    }));
    const amountTotal = lines
      .reduce((sum, line) => sum + Number(line.subtotal), 0)
      .toFixed(2);

    const order = await this.saleOrderRepository.save(
      this.saleOrderRepository.create({
        partnerId: quoteRequest.requesterPartnerId,
        providerPartnerId: dto.providerPartnerId,
        quoteRequestId: quoteRequest.id,
        orderType: SaleOrderType.QUOTE,
        state: SaleOrderState.SENT,
        currencyId: dto.currencyId,
        amountTotal,
      }),
    );

    await this.saleOrderLineRepository.save(
      lines.map((line) =>
        this.saleOrderLineRepository.create({
          saleOrderId: order.id,
          productTemplateId: line.productTemplateId,
          quantity: String(line.quantity),
          unitPrice: line.unitPrice,
          subtotal: line.subtotal,
        }),
      ),
    );

    return order;
  }

  /** Comparación multi-prestador: todas las cotizaciones recibidas para una solicitud. */
  async getComparison(quoteRequestId: number): Promise<SaleOrder[]> {
    await this.getQuoteRequest(quoteRequestId);
    return this.saleOrderRepository.find({
      where: { quoteRequestId, orderType: SaleOrderType.QUOTE },
      order: { amountTotal: 'ASC' },
    });
  }

  async selectQuote(
    quoteRequestId: number,
    dto: SelectQuoteDto,
    actor: RequestUser,
  ): Promise<Case> {
    const quoteRequest = await this.getQuoteRequest(quoteRequestId);
    this.assertOwnsPartner(quoteRequest.requesterPartnerId, actor);

    const selected = await this.saleOrderRepository.findOne({
      where: { id: dto.selectedSaleOrderId, quoteRequestId },
    });
    if (!selected) {
      throw new NotFoundException(
        'La cotización seleccionada no pertenece a esta solicitud',
      );
    }

    await this.quoteComparisonRepository.save(
      this.quoteComparisonRepository.create({
        quoteRequestId,
        selectedSaleOrderId: selected.id,
        comparedAt: new Date(),
        notes: dto.notes ?? null,
      }),
    );

    quoteRequest.status = QuoteRequestStatus.COMPARED;
    await this.quoteRequestRepository.save(quoteRequest);

    return this.confirmContract(selected);
  }

  // ---- Carrito -----------------------------------------------------------------

  async getCart(partnerId: number): Promise<{
    cart: ServiceCart;
    items: ServiceCartItem[];
  }> {
    const cart = await this.getOrCreateOpenCart(partnerId);
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
    });
    return { cart, items };
  }

  async addCartItem(
    partnerId: number,
    dto: AddCartItemDto,
  ): Promise<ServiceCartItem> {
    const cart = await this.getOrCreateOpenCart(partnerId);
    const tariff = await this.catalogService.getServiceTariff(
      dto.productTemplateId,
    );
    if (tariff.length === 0) {
      throw new BadRequestException('El servicio no tiene tarifa configurada');
    }
    const [priceItem] = tariff;

    const existing = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productTemplateId: dto.productTemplateId },
    });
    if (existing) {
      existing.quantity += dto.quantity ?? 1;
      return this.cartItemRepository.save(existing);
    }

    return this.cartItemRepository.save(
      this.cartItemRepository.create({
        cartId: cart.id,
        productTemplateId: dto.productTemplateId,
        quantity: dto.quantity ?? 1,
        unitPriceSnapshot: priceItem.price,
        currencyId: priceItem.pricelist.currencyId,
      }),
    );
  }

  /** Cierra el carrito: un contrato (sale_order + expediente) por prestador presente en el carrito. */
  async checkout(partnerId: number): Promise<Case[]> {
    const cart = await this.getOrCreateOpenCart(partnerId);
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
    });
    if (items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const itemsByProvider = new Map<number, ServiceCartItem[]>();
    for (const item of items) {
      const providerId = item.productTemplate.providerPartnerId;
      if (!providerId) {
        throw new BadRequestException(
          `El servicio '${item.productTemplate.name}' no tiene prestador asignado`,
        );
      }
      const bucket = itemsByProvider.get(providerId) ?? [];
      bucket.push(item);
      itemsByProvider.set(providerId, bucket);
    }

    const cases: Case[] = [];
    for (const [providerPartnerId, providerItems] of itemsByProvider) {
      const amountTotal = providerItems
        .reduce(
          (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
          0,
        )
        .toFixed(2);

      const order = await this.saleOrderRepository.save(
        this.saleOrderRepository.create({
          partnerId,
          providerPartnerId,
          orderType: SaleOrderType.CONTRACT,
          state: SaleOrderState.DRAFT,
          currencyId: providerItems[0].currencyId,
          amountTotal,
        }),
      );

      await this.saleOrderLineRepository.save(
        providerItems.map((item) =>
          this.saleOrderLineRepository.create({
            saleOrderId: order.id,
            productTemplateId: item.productTemplateId,
            quantity: String(item.quantity),
            unitPrice: item.unitPriceSnapshot,
            subtotal: (Number(item.unitPriceSnapshot) * item.quantity).toFixed(
              2,
            ),
          }),
        ),
      );

      cases.push(await this.confirmContract(order));
    }

    cart.status = ServiceCartStatus.CHECKED_OUT;
    await this.cartRepository.save(cart);

    return cases;
  }

  // ---- Órdenes / facturación ---------------------------------------------------

  async getOrder(id: number, actor: RequestUser): Promise<SaleOrder> {
    const order = await this.saleOrderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    this.assertOwnsPartner(order.partnerId, actor);
    return order;
  }

  async listMyOrders(
    partnerId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<SaleOrder>> {
    const [data, total] = await this.saleOrderRepository.findAndCount({
      where: { partnerId },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async listOrderInvoices(
    id: number,
    actor: RequestUser,
  ): Promise<AccountMove[]> {
    await this.getOrder(id, actor);
    return this.billingService.listInvoicesForOrder(id);
  }

  async listOrderPayments(
    id: number,
    actor: RequestUser,
  ): Promise<AccountPayment[]> {
    await this.getOrder(id, actor);
    return this.billingService.listPaymentsForOrder(id);
  }

  // ---- Internos ------------------------------------------------------------------

  private async confirmContract(order: SaleOrder): Promise<Case> {
    order.orderType = SaleOrderType.CONTRACT;
    order.state = SaleOrderState.CONFIRMED;
    order.confirmedAt = new Date();
    await this.saleOrderRepository.save(order);

    const importadorGroup = await this.groupRepository.findOneOrFail({
      where: { code: IMPORTADOR_EXPORTADOR_GROUP_CODE },
    });
    const createdCase = await this.casesService.createCase({
      ownerPartnerId: order.partnerId,
      profileGroupId: importadorGroup.id,
      description: `Contrato comercial — orden #${order.id}`,
    });

    const lines = await this.saleOrderLineRepository.find({
      where: { saleOrderId: order.id },
    });
    await this.billingService.createInvoice(
      order.partnerId,
      order.id,
      order.currencyId,
      lines.map((line) => ({
        description: line.productTemplate.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
      })),
    );

    return createdCase;
  }

  private async getOrCreateOpenCart(partnerId: number): Promise<ServiceCart> {
    const existing = await this.cartRepository.findOne({
      where: { partnerId, status: ServiceCartStatus.OPEN },
    });
    if (existing) return existing;
    return this.cartRepository.save(
      this.cartRepository.create({ partnerId, status: ServiceCartStatus.OPEN }),
    );
  }

  private assertOwnsPartner(partnerId: number, actor: RequestUser): void {
    if (actor.groupCodes.includes('admin')) return;
    if (partnerId !== actor.partnerId) {
      throw new ForbiddenException('No tiene acceso a este recurso');
    }
  }
}
