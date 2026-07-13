import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelName } from '../../common/constants/model-names';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SequenceService } from '../config/sequence.service';
import { DocumentChecklist } from '../documents/entities/document-checklist.entity';
import { DocumentsService } from '../documents/documents.service';
import { GovernanceService } from '../governance/governance.service';
import { AddCasePartyDto } from './dto/add-case-party.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateSemaphoreDto } from './dto/update-semaphore.dto';
import { CaseParty, CasePartyRole } from './entities/case-party.entity';
import {
  CaseSemaphore,
  SemaphoreColor,
} from './entities/case-semaphore.entity';
import { Case, CaseStatus } from './entities/case.entity';

const CASE_SEQUENCE_CODE = 'agd_case';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case) private readonly caseRepository: Repository<Case>,
    @InjectRepository(CaseParty)
    private readonly casePartyRepository: Repository<CaseParty>,
    @InjectRepository(CaseSemaphore)
    private readonly caseSemaphoreRepository: Repository<CaseSemaphore>,
    private readonly sequenceService: SequenceService,
    private readonly governanceService: GovernanceService,
    private readonly documentsService: DocumentsService,
  ) {}

  async createCase(dto: CreateCaseDto): Promise<Case> {
    const code = await this.sequenceService.next(CASE_SEQUENCE_CODE);

    const savedCase = await this.caseRepository.save(
      this.caseRepository.create({
        code,
        ownerPartnerId: dto.ownerPartnerId,
        profileGroupId: dto.profileGroupId,
        description: dto.description ?? null,
        status: CaseStatus.OPEN,
        openedAt: new Date(),
      }),
    );

    await this.casePartyRepository.save(
      this.casePartyRepository.create({
        caseId: savedCase.id,
        partnerId: dto.ownerPartnerId,
        role: CasePartyRole.OWNER,
      }),
    );

    await this.caseSemaphoreRepository.save(
      this.caseSemaphoreRepository.create({
        caseId: savedCase.id,
        color: SemaphoreColor.GREEN,
      }),
    );

    const requirementCodes =
      await this.governanceService.getRequirementCodesForGroup(
        dto.profileGroupId,
      );
    await this.documentsService.seedChecklist(
      ModelName.CASE,
      savedCase.id,
      requirementCodes,
    );

    return savedCase;
  }

  async getCase(id: number): Promise<Case> {
    const found = await this.caseRepository.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Expediente no encontrado');
    return found;
  }

  async listCases(
    query: PaginationQueryDto,
    ownerPartnerId?: number,
  ): Promise<PaginatedResponseDto<Case>> {
    const [data, total] = await this.caseRepository.findAndCount({
      where: ownerPartnerId ? { ownerPartnerId } : {},
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async listParties(caseId: number): Promise<CaseParty[]> {
    await this.getCase(caseId);
    return this.casePartyRepository.find({ where: { caseId } });
  }

  async addParty(caseId: number, dto: AddCasePartyDto): Promise<CaseParty> {
    await this.getCase(caseId);
    const existing = await this.casePartyRepository.findOne({
      where: { caseId, partnerId: dto.partnerId, role: dto.role },
    });
    if (existing) return existing;
    return this.casePartyRepository.save(
      this.casePartyRepository.create({ caseId, ...dto }),
    );
  }

  async getSemaphore(caseId: number): Promise<CaseSemaphore> {
    const semaphore = await this.caseSemaphoreRepository.findOne({
      where: { caseId },
    });
    if (!semaphore) throw new NotFoundException('Semáforo no encontrado');
    return semaphore;
  }

  async updateSemaphore(
    caseId: number,
    dto: UpdateSemaphoreDto,
  ): Promise<CaseSemaphore> {
    const semaphore = await this.getSemaphore(caseId);
    semaphore.color = dto.color;
    semaphore.reason = dto.reason ?? null;
    semaphore.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    return this.caseSemaphoreRepository.save(semaphore);
  }

  getChecklist(caseId: number): Promise<DocumentChecklist[]> {
    return this.documentsService.getChecklist(ModelName.CASE, caseId);
  }

  /** Cierre de expediente: exige que todo el checklist obligatorio esté cumplido. */
  async closeCase(caseId: number): Promise<Case> {
    const found = await this.getCase(caseId);
    if (found.status === CaseStatus.CLOSED) {
      throw new BadRequestException('El expediente ya está cerrado');
    }

    const checklist = await this.documentsService.getChecklist(
      ModelName.CASE,
      caseId,
    );
    const pending = checklist.filter(
      (item) => item.documentRequirement.mandatory && !item.fulfilled,
    );
    if (pending.length > 0) {
      throw new BadRequestException(
        `No se puede cerrar: faltan documentos obligatorios (${pending
          .map((item) => item.documentRequirement.name)
          .join(', ')})`,
      );
    }

    found.status = CaseStatus.CLOSED;
    found.closedAt = new Date();
    return this.caseRepository.save(found);
  }
}
