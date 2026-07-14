import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomsRegimeDto } from './dto/create-customs-regime.dto';
import { CreateDuaDto } from './dto/create-dua.dto';
import { CreateModaiInspectionDto } from './dto/create-modai-inspection.dto';
import { CreateModcarManifestDto } from './dto/create-modcar-manifest.dto';
import { CreateModshdExitPassDto } from './dto/create-modshd-exit-pass.dto';
import { CreateTaxSimulationDto } from './dto/create-tax-simulation.dto';
import { FindCaseReferenceDto } from './dto/find-case-reference.dto';
import { UpdateModaiInspectionDto } from './dto/update-modai-inspection.dto';
import { SidUneaCustomsRegime } from './entities/sidunea-customs-regime.entity';
import { SidUneaDuaItem } from './entities/sidunea-dua-item.entity';
import { SidUneaDua } from './entities/sidunea-dua.entity';
import {
  SidUneaMirrorRecord,
  SidUneaRecordType,
} from './entities/sidunea-mirror-record.entity';
import {
  ModaiInspectionResult,
  SidUneaModaiInspection,
} from './entities/sidunea-modai-inspection.entity';
import { SidUneaModcarManifest } from './entities/sidunea-modcar-manifest.entity';
import { SidUneaModshdExitPass } from './entities/sidunea-modshd-exit-pass.entity';
import { SidUneaTaxSimulation } from './entities/sidunea-tax-simulation.entity';

@Injectable()
export class SidUneaService {
  constructor(
    @InjectRepository(SidUneaMirrorRecord)
    private readonly mirrorRecordRepository: Repository<SidUneaMirrorRecord>,
    @InjectRepository(SidUneaDua)
    private readonly duaRepository: Repository<SidUneaDua>,
    @InjectRepository(SidUneaDuaItem)
    private readonly duaItemRepository: Repository<SidUneaDuaItem>,
    @InjectRepository(SidUneaModcarManifest)
    private readonly manifestRepository: Repository<SidUneaModcarManifest>,
    @InjectRepository(SidUneaModshdExitPass)
    private readonly exitPassRepository: Repository<SidUneaModshdExitPass>,
    @InjectRepository(SidUneaCustomsRegime)
    private readonly customsRegimeRepository: Repository<SidUneaCustomsRegime>,
    @InjectRepository(SidUneaModaiInspection)
    private readonly modaiInspectionRepository: Repository<SidUneaModaiInspection>,
    @InjectRepository(SidUneaTaxSimulation)
    private readonly taxSimulationRepository: Repository<SidUneaTaxSimulation>,
  ) {}

  async createDua(dto: CreateDuaDto): Promise<SidUneaDua> {
    const dua = await this.duaRepository.save(
      this.duaRepository.create({
        caseId: dto.caseId,
        duaNumber: dto.duaNumber,
        customsDeclarationId: dto.customsDeclarationId ?? null,
        registeredAt: new Date(),
      }),
    );

    if (dto.items && dto.items.length > 0) {
      await this.duaItemRepository.save(
        dto.items.map((item) =>
          this.duaItemRepository.create({
            sidUneaDuaId: dua.id,
            description: item.description,
            tariffCode: item.tariffCode ?? null,
            quantity: String(item.quantity),
            value: item.value,
          }),
        ),
      );
    }

    await this.mirror(dto.caseId, SidUneaRecordType.DUA, dto.duaNumber);
    return dua;
  }

  async getDua(id: number): Promise<SidUneaDua & { items: SidUneaDuaItem[] }> {
    const dua = await this.duaRepository.findOne({ where: { id } });
    if (!dua) throw new NotFoundException('DUA no encontrada');
    const items = await this.duaItemRepository.find({
      where: { sidUneaDuaId: id },
    });
    return { ...dua, items };
  }

  async createManifest(
    dto: CreateModcarManifestDto,
  ): Promise<SidUneaModcarManifest> {
    const manifest = await this.manifestRepository.save(
      this.manifestRepository.create({
        caseId: dto.caseId,
        manifestNumber: dto.manifestNumber,
        carrierName: dto.carrierName ?? null,
        arrivalDate: dto.arrivalDate ?? null,
      }),
    );
    await this.mirror(
      dto.caseId,
      SidUneaRecordType.MANIFEST,
      dto.manifestNumber,
    );
    return manifest;
  }

  /** Usado por `wms` para exigir que la recepción ocurra contra un manifiesto real del expediente. */
  async assertManifestBelongsToCase(
    caseId: number,
    manifestNumber: string,
  ): Promise<void> {
    const manifest = await this.manifestRepository.findOne({
      where: { caseId, manifestNumber },
    });
    if (!manifest) {
      throw new NotFoundException(
        `El manifiesto '${manifestNumber}' no está registrado para este expediente`,
      );
    }
  }

  async createExitPass(
    dto: CreateModshdExitPassDto,
  ): Promise<SidUneaModshdExitPass> {
    const exitPass = await this.exitPassRepository.save(
      this.exitPassRepository.create({
        caseId: dto.caseId,
        exitPassNumber: dto.exitPassNumber,
        issuedAt: new Date(),
      }),
    );
    await this.mirror(
      dto.caseId,
      SidUneaRecordType.EXIT_PASS,
      dto.exitPassNumber,
    );
    return exitPass;
  }

  /** Resuelve el expediente a partir de exactamente una referencia SIDUNEA. */
  async findCaseIdByReference(dto: FindCaseReferenceDto): Promise<number> {
    const provided = [dto.dua, dto.manifest, dto.exitPass].filter(Boolean);
    if (provided.length !== 1) {
      throw new BadRequestException(
        'Debe indicar exactamente una referencia: dua, manifest o exitPass',
      );
    }

    if (dto.dua) {
      const dua = await this.duaRepository.findOne({
        where: { duaNumber: dto.dua },
      });
      if (!dua) throw new NotFoundException('DUA no encontrada');
      return dua.caseId;
    }

    if (dto.manifest) {
      const manifest = await this.manifestRepository.findOne({
        where: { manifestNumber: dto.manifest },
      });
      if (!manifest) throw new NotFoundException('Manifiesto no encontrado');
      return manifest.caseId;
    }

    const exitPass = await this.exitPassRepository.findOne({
      where: { exitPassNumber: dto.exitPass },
    });
    if (!exitPass) throw new NotFoundException('Hoja de salida no encontrada');
    return exitPass.caseId;
  }

  listMirrorRecords(caseId: number): Promise<SidUneaMirrorRecord[]> {
    return this.mirrorRecordRepository.find({
      where: { caseId },
      order: { mirroredAt: 'DESC' },
    });
  }

  // ---- Regímenes aduaneros -------------------------------------------------

  listCustomsRegimes(): Promise<SidUneaCustomsRegime[]> {
    return this.customsRegimeRepository.find({ where: { active: true } });
  }

  createCustomsRegime(
    dto: CreateCustomsRegimeDto,
  ): Promise<SidUneaCustomsRegime> {
    return this.customsRegimeRepository.save(
      this.customsRegimeRepository.create(dto),
    );
  }

  async getCustomsRegime(id: number): Promise<SidUneaCustomsRegime> {
    const regime = await this.customsRegimeRepository.findOne({
      where: { id, active: true },
    });
    if (!regime) throw new NotFoundException('Régimen aduanero no encontrado');
    return regime;
  }

  // ---- Inspección MODAI -----------------------------------------------------

  async createModaiInspection(
    dto: CreateModaiInspectionDto,
  ): Promise<SidUneaModaiInspection> {
    const inspection = await this.modaiInspectionRepository.save(
      this.modaiInspectionRepository.create({
        caseId: dto.caseId,
        inspectionNumber: dto.inspectionNumber,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      }),
    );
    await this.mirror(
      dto.caseId,
      SidUneaRecordType.INSPECTION,
      dto.inspectionNumber,
    );
    return inspection;
  }

  listModaiInspections(caseId: number): Promise<SidUneaModaiInspection[]> {
    return this.modaiInspectionRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateModaiInspection(
    id: number,
    dto: UpdateModaiInspectionDto,
  ): Promise<SidUneaModaiInspection> {
    const inspection = await this.modaiInspectionRepository.findOne({
      where: { id },
    });
    if (!inspection) throw new NotFoundException('Inspección no encontrada');
    if (inspection.result !== ModaiInspectionResult.PENDING) {
      throw new BadRequestException('La inspección ya fue resuelta');
    }

    inspection.result = dto.result;
    inspection.notes = dto.notes ?? null;
    return this.modaiInspectionRepository.save(inspection);
  }

  // ---- Simulación de tributos -------------------------------------------------

  async createTaxSimulation(
    dto: CreateTaxSimulationDto,
  ): Promise<SidUneaTaxSimulation> {
    const simulation = await this.taxSimulationRepository.save(
      this.taxSimulationRepository.create({
        caseId: dto.caseId,
        estimatedTaxes: dto.estimatedTaxes,
        currencyId: dto.currencyId,
        breakdown: dto.breakdown ?? null,
        simulatedAt: new Date(),
      }),
    );
    await this.mirror(
      dto.caseId,
      SidUneaRecordType.TAX_SIMULATION,
      `SIM-${simulation.id}`,
    );
    return simulation;
  }

  listTaxSimulations(caseId: number): Promise<SidUneaTaxSimulation[]> {
    return this.taxSimulationRepository.find({
      where: { caseId },
      order: { simulatedAt: 'DESC' },
    });
  }

  private async mirror(
    caseId: number,
    recordType: SidUneaRecordType,
    referenceNumber: string,
  ): Promise<void> {
    await this.mirrorRecordRepository.insert({
      caseId,
      recordType,
      referenceNumber,
      mirroredAt: new Date(),
    });
  }
}
