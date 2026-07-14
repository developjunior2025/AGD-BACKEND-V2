import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeadlineRule } from '../config/entities/deadline-rule.entity';
import { SidUneaService } from '../sidunea/sidunea.service';
import { CreatePickingOrderDto } from '../warehouse/dto/create-picking-order.dto';
import { CreateReceiptDto } from '../warehouse/dto/create-receipt.dto';
import { StockPicking } from '../warehouse/entities/stock-picking.entity';
import { StockQuant } from '../warehouse/entities/stock-quant.entity';
import { WarehouseService } from '../warehouse/warehouse.service';
import { AddDiscrepancyItemDto } from './dto/add-discrepancy-item.dto';
import { CreateCargoHandlingTaskDto } from './dto/create-cargo-handling-task.dto';
import { CreateConsolidationOrderDto } from './dto/create-consolidation-order.dto';
import { CreateReceiptDiscrepancyDto } from './dto/create-receipt-discrepancy.dto';
import { CreateWeighingTicketDto } from './dto/create-weighing-ticket.dto';
import { CargoHandlingTask } from './entities/cargo-handling-task.entity';
import {
  ConsolidationOrder,
  ConsolidationOrderStatus,
} from './entities/consolidation-order.entity';
import {
  CustodyRecord,
  CustodyRecordStatus,
} from './entities/custody-record.entity';
import { DeconsolidationOrder } from './entities/deconsolidation-order.entity';
import {
  DiscrepancyMatrix,
  DiscrepancyMatrixStatus,
} from './entities/discrepancy-matrix.entity';
import { DiscrepancyItem } from './entities/discrepancy-item.entity';
import { ReceiptDiscrepancy } from './entities/receipt-discrepancy.entity';
import {
  StoragePeriod,
  StoragePeriodStatus,
} from './entities/storage-period.entity';
import { WeighingTicket } from './entities/weighing-ticket.entity';

const DEFAULT_STORAGE_DAYS = 30;
const STORAGE_DEADLINE_RULE_CODE = 'wms_storage_period';

@Injectable()
export class WmsService {
  constructor(
    @InjectRepository(ReceiptDiscrepancy)
    private readonly receiptDiscrepancyRepository: Repository<ReceiptDiscrepancy>,
    @InjectRepository(CustodyRecord)
    private readonly custodyRecordRepository: Repository<CustodyRecord>,
    @InjectRepository(StoragePeriod)
    private readonly storagePeriodRepository: Repository<StoragePeriod>,
    @InjectRepository(WeighingTicket)
    private readonly weighingTicketRepository: Repository<WeighingTicket>,
    @InjectRepository(ConsolidationOrder)
    private readonly consolidationOrderRepository: Repository<ConsolidationOrder>,
    @InjectRepository(DeconsolidationOrder)
    private readonly deconsolidationOrderRepository: Repository<DeconsolidationOrder>,
    @InjectRepository(CargoHandlingTask)
    private readonly cargoHandlingTaskRepository: Repository<CargoHandlingTask>,
    @InjectRepository(DiscrepancyMatrix)
    private readonly discrepancyMatrixRepository: Repository<DiscrepancyMatrix>,
    @InjectRepository(DiscrepancyItem)
    private readonly discrepancyItemRepository: Repository<DiscrepancyItem>,
    @InjectRepository(DeadlineRule)
    private readonly deadlineRuleRepository: Repository<DeadlineRule>,
    private readonly warehouseService: WarehouseService,
    private readonly sidUneaService: SidUneaService,
  ) {}

  // ---- Recepción y custodia ----------------------------------------------------

  async createReceipt(dto: CreateReceiptDto): Promise<StockPicking> {
    await this.sidUneaService.assertManifestBelongsToCase(
      dto.caseId,
      dto.manifestNumber,
    );

    const picking = await this.warehouseService.createReceipt(dto);

    const existingCustody = await this.custodyRecordRepository.findOne({
      where: { caseId: dto.caseId, status: CustodyRecordStatus.ACTIVE },
    });
    if (!existingCustody) {
      await this.custodyRecordRepository.save(
        this.custodyRecordRepository.create({
          caseId: dto.caseId,
          locationId: dto.lines[0].destLocationId,
          startAt: new Date(),
          status: CustodyRecordStatus.ACTIVE,
        }),
      );
    }

    const existingPeriod = await this.storagePeriodRepository.findOne({
      where: { caseId: dto.caseId },
    });
    if (!existingPeriod) {
      const days = await this.getStorageDeadlineDays();
      const startDate = new Date();
      const legalDeadline = new Date(startDate);
      legalDeadline.setDate(legalDeadline.getDate() + days);
      await this.storagePeriodRepository.save(
        this.storagePeriodRepository.create({
          caseId: dto.caseId,
          startDate: startDate.toISOString().slice(0, 10),
          legalDeadline: legalDeadline.toISOString().slice(0, 10),
          status: StoragePeriodStatus.WITHIN_PERIOD,
        }),
      );
    }

    return picking;
  }

  getInventory(caseId?: number, locationId?: number): Promise<StockQuant[]> {
    return this.warehouseService.getInventory({ caseId, locationId });
  }

  createPickingOrder(dto: CreatePickingOrderDto): Promise<StockPicking> {
    return this.warehouseService.createPickingOrder(dto);
  }

  listCustodyRecords(caseId: number): Promise<CustodyRecord[]> {
    return this.custodyRecordRepository.find({
      where: { caseId },
      order: { startAt: 'DESC' },
    });
  }

  listStoragePeriods(caseId: number): Promise<StoragePeriod[]> {
    return this.storagePeriodRepository.find({ where: { caseId } });
  }

  // ---- Pesaje --------------------------------------------------------------------

  createWeighingTicket(dto: CreateWeighingTicketDto): Promise<WeighingTicket> {
    const netWeight = (
      Number(dto.grossWeight) - Number(dto.tareWeight ?? '0')
    ).toFixed(2);
    return this.weighingTicketRepository.save(
      this.weighingTicketRepository.create({
        caseId: dto.caseId,
        stockPickingId: dto.stockPickingId ?? null,
        grossWeight: dto.grossWeight,
        tareWeight: dto.tareWeight ?? null,
        netWeight,
        weighedAt: new Date(),
      }),
    );
  }

  // ---- Consolidación / desconsolidación / manipulación ---------------------------

  createConsolidationOrder(
    dto: CreateConsolidationOrderDto,
  ): Promise<ConsolidationOrder> {
    return this.consolidationOrderRepository.save(
      this.consolidationOrderRepository.create({
        caseId: dto.caseId,
        notes: dto.notes ?? null,
        status: ConsolidationOrderStatus.DRAFT,
      }),
    );
  }

  createDeconsolidationOrder(
    dto: CreateConsolidationOrderDto,
  ): Promise<DeconsolidationOrder> {
    return this.deconsolidationOrderRepository.save(
      this.deconsolidationOrderRepository.create({
        caseId: dto.caseId,
        notes: dto.notes ?? null,
        status: ConsolidationOrderStatus.DRAFT,
      }),
    );
  }

  createCargoHandlingTask(
    dto: CreateCargoHandlingTaskDto,
  ): Promise<CargoHandlingTask> {
    return this.cargoHandlingTaskRepository.save(
      this.cargoHandlingTaskRepository.create({
        caseId: dto.caseId,
        taskType: dto.taskType,
        assignedToUserId: dto.assignedToUserId ?? null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      }),
    );
  }

  // ---- Discrepancias y conciliación SIDUNEA–AGD ------------------------------------

  createReceiptDiscrepancy(
    dto: CreateReceiptDiscrepancyDto,
  ): Promise<ReceiptDiscrepancy> {
    return this.receiptDiscrepancyRepository.save(
      this.receiptDiscrepancyRepository.create({
        stockPickingId: dto.stockPickingId,
        discrepancyType: dto.discrepancyType,
        description: dto.description,
        quantity: dto.quantity ?? null,
      }),
    );
  }

  async getDiscrepancyMatrix(caseId: number): Promise<{
    matrix: DiscrepancyMatrix;
    items: DiscrepancyItem[];
  }> {
    const matrix = await this.getOrCreateMatrix(caseId);
    const items = await this.discrepancyItemRepository.find({
      where: { discrepancyMatrixId: matrix.id },
    });
    return { matrix, items };
  }

  async addDiscrepancyItem(
    dto: AddDiscrepancyItemDto,
  ): Promise<DiscrepancyItem> {
    const matrix = await this.getOrCreateMatrix(dto.caseId);
    const item = await this.discrepancyItemRepository.save(
      this.discrepancyItemRepository.create({
        discrepancyMatrixId: matrix.id,
        sidUneaReference: dto.sidUneaReference ?? null,
        description: dto.description,
        quantityDifference: dto.quantityDifference ?? null,
      }),
    );

    matrix.totalDiscrepancies += 1;
    matrix.status = DiscrepancyMatrixStatus.PENDING;
    matrix.reconciledAt = null;
    await this.discrepancyMatrixRepository.save(matrix);

    return item;
  }

  async resolveDiscrepancyItem(itemId: number): Promise<DiscrepancyItem> {
    const item = await this.discrepancyItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Diferencia no encontrada');
    item.resolved = true;
    return this.discrepancyItemRepository.save(item);
  }

  async reconcileMatrix(caseId: number): Promise<DiscrepancyMatrix> {
    const matrix = await this.getOrCreateMatrix(caseId);
    const items = await this.discrepancyItemRepository.find({
      where: { discrepancyMatrixId: matrix.id },
    });
    const pending = items.filter((item) => !item.resolved);
    if (pending.length > 0) {
      throw new BadRequestException(
        `Quedan ${pending.length} diferencia(s) sin resolver`,
      );
    }

    matrix.status = DiscrepancyMatrixStatus.RECONCILED;
    matrix.reconciledAt = new Date();
    return this.discrepancyMatrixRepository.save(matrix);
  }

  private async getOrCreateMatrix(caseId: number): Promise<DiscrepancyMatrix> {
    const existing = await this.discrepancyMatrixRepository.findOne({
      where: { caseId },
    });
    if (existing) return existing;
    return this.discrepancyMatrixRepository.save(
      this.discrepancyMatrixRepository.create({ caseId }),
    );
  }

  private async getStorageDeadlineDays(): Promise<number> {
    const rule = await this.deadlineRuleRepository.findOne({
      where: { code: STORAGE_DEADLINE_RULE_CODE, active: true },
    });
    return rule?.daysToDeadline ?? DEFAULT_STORAGE_DAYS;
  }
}
