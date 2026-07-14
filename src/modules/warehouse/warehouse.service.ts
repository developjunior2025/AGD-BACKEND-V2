import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SequenceService } from '../config/sequence.service';
import { CreatePickingOrderDto } from './dto/create-picking-order.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { StockLocation } from './entities/stock-location.entity';
import { StockLot } from './entities/stock-lot.entity';
import { StockMoveLine } from './entities/stock-move-line.entity';
import { StockMove, StockMoveState } from './entities/stock-move.entity';
import {
  StockPickingType,
  StockPickingTypeCode,
} from './entities/stock-picking-type.entity';
import {
  StockPicking,
  StockPickingState,
} from './entities/stock-picking.entity';
import { StockQuant } from './entities/stock-quant.entity';
import { StockWarehouse } from './entities/stock-warehouse.entity';

const PICKING_SEQUENCE_CODE = 'stock_picking';
const EXTERNAL_SUPPLIER_LOCATION_CODE = 'EXT-PROV';
const EXTERNAL_CUSTOMER_LOCATION_CODE = 'EXT-CLI';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(StockWarehouse)
    private readonly warehouseRepository: Repository<StockWarehouse>,
    @InjectRepository(StockLocation)
    private readonly locationRepository: Repository<StockLocation>,
    @InjectRepository(StockPickingType)
    private readonly pickingTypeRepository: Repository<StockPickingType>,
    @InjectRepository(StockPicking)
    private readonly pickingRepository: Repository<StockPicking>,
    @InjectRepository(StockMove)
    private readonly moveRepository: Repository<StockMove>,
    @InjectRepository(StockMoveLine)
    private readonly moveLineRepository: Repository<StockMoveLine>,
    @InjectRepository(StockQuant)
    private readonly quantRepository: Repository<StockQuant>,
    @InjectRepository(StockLot)
    private readonly lotRepository: Repository<StockLot>,
    private readonly sequenceService: SequenceService,
  ) {}

  listWarehouses(): Promise<StockWarehouse[]> {
    return this.warehouseRepository.find({ where: { active: true } });
  }

  listLocations(): Promise<StockLocation[]> {
    return this.locationRepository.find({ where: { active: true } });
  }

  listPickingTypes(): Promise<StockPickingType[]> {
    return this.pickingTypeRepository.find();
  }

  async getPicking(id: number): Promise<StockPicking> {
    const picking = await this.pickingRepository.findOne({ where: { id } });
    if (!picking) throw new NotFoundException('Movimiento no encontrado');
    return picking;
  }

  listPickingsByCase(caseId: number): Promise<StockPicking[]> {
    return this.pickingRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Recepción contra manifiesto/BL: entra mercancía y sube el saldo de inventario del expediente. */
  async createReceipt(dto: CreateReceiptDto): Promise<StockPicking> {
    const pickingType = await this.getPickingType(
      StockPickingTypeCode.INCOMING,
    );
    const supplierLocation = await this.getExternalLocation(
      EXTERNAL_SUPPLIER_LOCATION_CODE,
    );

    const picking = await this.pickingRepository.save(
      this.pickingRepository.create({
        reference: await this.sequenceService.next(PICKING_SEQUENCE_CODE),
        pickingTypeId: pickingType.id,
        caseId: dto.caseId,
        manifestNumber: dto.manifestNumber,
        blNumber: dto.blNumber ?? null,
        state: StockPickingState.DRAFT,
      }),
    );

    for (const line of dto.lines) {
      await this.executeMove(
        picking,
        line.productTemplateId,
        line.quantity,
        supplierLocation.id,
        line.destLocationId,
        dto.caseId,
        line.lotName,
      );
    }

    picking.state = StockPickingState.DONE;
    picking.doneAt = new Date();
    return this.pickingRepository.save(picking);
  }

  /** Despacho/picking de salida: baja el saldo de inventario del expediente. */
  async createPickingOrder(dto: CreatePickingOrderDto): Promise<StockPicking> {
    const pickingType = await this.getPickingType(
      StockPickingTypeCode.OUTGOING,
    );
    const customerLocation = await this.getExternalLocation(
      EXTERNAL_CUSTOMER_LOCATION_CODE,
    );

    for (const line of dto.lines) {
      const available = await this.quantRepository.findOne({
        where: {
          caseId: dto.caseId,
          productTemplateId: line.productTemplateId,
          locationId: line.sourceLocationId,
        },
      });
      if (!available || Number(available.quantity) < line.quantity) {
        throw new BadRequestException(
          `Inventario insuficiente para el producto ${line.productTemplateId} en la ubicación ${line.sourceLocationId}`,
        );
      }
    }

    const picking = await this.pickingRepository.save(
      this.pickingRepository.create({
        reference: await this.sequenceService.next(PICKING_SEQUENCE_CODE),
        pickingTypeId: pickingType.id,
        caseId: dto.caseId,
        state: StockPickingState.DRAFT,
      }),
    );

    for (const line of dto.lines) {
      await this.executeMove(
        picking,
        line.productTemplateId,
        line.quantity,
        line.sourceLocationId,
        customerLocation.id,
        dto.caseId,
      );
    }

    picking.state = StockPickingState.DONE;
    picking.doneAt = new Date();
    return this.pickingRepository.save(picking);
  }

  getInventory(filters: {
    caseId?: number;
    locationId?: number;
  }): Promise<StockQuant[]> {
    return this.quantRepository.find({
      where: {
        ...(filters.caseId ? { caseId: filters.caseId } : {}),
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      order: { updatedAt: 'DESC' },
    });
  }

  private async executeMove(
    picking: StockPicking,
    productTemplateId: number,
    quantity: number,
    sourceLocationId: number,
    destLocationId: number,
    caseId: number,
    lotName?: string,
  ): Promise<void> {
    const move = await this.moveRepository.save(
      this.moveRepository.create({
        pickingId: picking.id,
        productTemplateId,
        quantity: String(quantity),
        sourceLocationId,
        destLocationId,
        state: StockMoveState.DONE,
      }),
    );

    let lotId: number | null = null;
    if (lotName) {
      const lot =
        (await this.lotRepository.findOne({ where: { name: lotName } })) ??
        (await this.lotRepository.save(
          this.lotRepository.create({ name: lotName, productTemplateId }),
        ));
      lotId = lot.id;
    }

    await this.moveLineRepository.save(
      this.moveLineRepository.create({
        moveId: move.id,
        lotId,
        quantity: String(quantity),
        locationId: destLocationId,
      }),
    );

    await this.adjustQuant(
      productTemplateId,
      sourceLocationId,
      caseId,
      -quantity,
    );
    await this.adjustQuant(productTemplateId, destLocationId, caseId, quantity);
  }

  private async adjustQuant(
    productTemplateId: number,
    locationId: number,
    caseId: number,
    delta: number,
  ): Promise<void> {
    const existing = await this.quantRepository.findOne({
      where: { productTemplateId, locationId, caseId },
    });
    if (existing) {
      existing.quantity = (Number(existing.quantity) + delta).toFixed(2);
      await this.quantRepository.save(existing);
      return;
    }
    await this.quantRepository.save(
      this.quantRepository.create({
        productTemplateId,
        locationId,
        caseId,
        quantity: String(delta),
      }),
    );
  }

  private async getPickingType(
    code: StockPickingTypeCode,
  ): Promise<StockPickingType> {
    const pickingType = await this.pickingTypeRepository.findOne({
      where: { code },
    });
    if (!pickingType) {
      throw new NotFoundException(
        `Tipo de movimiento '${code}' no configurado`,
      );
    }
    return pickingType;
  }

  private async getExternalLocation(zoneCode: string): Promise<StockLocation> {
    const location = await this.locationRepository.findOne({
      where: { zoneCode },
    });
    if (!location) {
      throw new NotFoundException(
        `Ubicación externa '${zoneCode}' no configurada`,
      );
    }
    return location;
  }
}
