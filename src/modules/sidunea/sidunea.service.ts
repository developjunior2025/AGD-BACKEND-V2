import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDuaDto } from './dto/create-dua.dto';
import { CreateModcarManifestDto } from './dto/create-modcar-manifest.dto';
import { CreateModshdExitPassDto } from './dto/create-modshd-exit-pass.dto';
import { FindCaseReferenceDto } from './dto/find-case-reference.dto';
import { SidUneaDua } from './entities/sidunea-dua.entity';
import {
  SidUneaMirrorRecord,
  SidUneaRecordType,
} from './entities/sidunea-mirror-record.entity';
import { SidUneaModcarManifest } from './entities/sidunea-modcar-manifest.entity';
import { SidUneaModshdExitPass } from './entities/sidunea-modshd-exit-pass.entity';

@Injectable()
export class SidUneaService {
  constructor(
    @InjectRepository(SidUneaMirrorRecord)
    private readonly mirrorRecordRepository: Repository<SidUneaMirrorRecord>,
    @InjectRepository(SidUneaDua)
    private readonly duaRepository: Repository<SidUneaDua>,
    @InjectRepository(SidUneaModcarManifest)
    private readonly manifestRepository: Repository<SidUneaModcarManifest>,
    @InjectRepository(SidUneaModshdExitPass)
    private readonly exitPassRepository: Repository<SidUneaModshdExitPass>,
  ) {}

  async createDua(dto: CreateDuaDto): Promise<SidUneaDua> {
    const dua = await this.duaRepository.save(
      this.duaRepository.create({
        caseId: dto.caseId,
        duaNumber: dto.duaNumber,
        registeredAt: new Date(),
      }),
    );
    await this.mirror(dto.caseId, SidUneaRecordType.DUA, dto.duaNumber);
    return dua;
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
