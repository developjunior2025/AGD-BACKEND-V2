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
import { CaseParty, CasePartyRole } from '../cases/entities/case-party.entity';
import { RequestUser } from '../identity/interfaces/request-user.interface';
import { SidUneaService } from '../sidunea/sidunea.service';
import { AddDeclarationItemDto } from './dto/add-declaration-item.dto';
import { AssignRegimeDto } from './dto/assign-regime.dto';
import { CreateDeclarationDto } from './dto/create-declaration.dto';
import { CreateLiquidationDto } from './dto/create-liquidation.dto';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CustomsDeclarationItem } from './entities/customs-declaration-item.entity';
import {
  CustomsDeclaration,
  CustomsDeclarationStatus,
} from './entities/customs-declaration.entity';
import {
  CustomsLicense,
  CustomsLicenseStatus,
} from './entities/customs-license.entity';
import { CustomsRegimeAssignment } from './entities/customs-regime-assignment.entity';
import { CustomsTaxLiquidation } from './entities/customs-tax-liquidation.entity';

@Injectable()
export class CustomsService {
  constructor(
    @InjectRepository(CustomsLicense)
    private readonly licenseRepository: Repository<CustomsLicense>,
    @InjectRepository(CustomsDeclaration)
    private readonly declarationRepository: Repository<CustomsDeclaration>,
    @InjectRepository(CustomsDeclarationItem)
    private readonly declarationItemRepository: Repository<CustomsDeclarationItem>,
    @InjectRepository(CustomsRegimeAssignment)
    private readonly regimeAssignmentRepository: Repository<CustomsRegimeAssignment>,
    @InjectRepository(CustomsTaxLiquidation)
    private readonly liquidationRepository: Repository<CustomsTaxLiquidation>,
    @InjectRepository(CaseParty)
    private readonly casePartyRepository: Repository<CaseParty>,
    private readonly sidUneaService: SidUneaService,
  ) {}

  // ---- Licencia --------------------------------------------------------------

  async verifyLicense(
    partnerId: number,
    dto: VerifyLicenseDto,
  ): Promise<CustomsLicense> {
    const existing = await this.licenseRepository.findOne({
      where: { partnerId },
    });
    if (existing) {
      existing.licenseNumber = dto.licenseNumber;
      existing.issuedAt = dto.issuedAt;
      existing.expiresAt = dto.expiresAt ?? null;
      existing.status = CustomsLicenseStatus.ACTIVE;
      return this.licenseRepository.save(existing);
    }

    return this.licenseRepository.save(
      this.licenseRepository.create({
        partnerId,
        licenseNumber: dto.licenseNumber,
        issuedAt: dto.issuedAt,
        expiresAt: dto.expiresAt ?? null,
        status: CustomsLicenseStatus.ACTIVE,
      }),
    );
  }

  async getLicense(partnerId: number): Promise<CustomsLicense> {
    const license = await this.licenseRepository.findOne({
      where: { partnerId },
    });
    if (!license) throw new NotFoundException('Licencia no encontrada');
    return license;
  }

  private async assertActiveLicense(partnerId: number): Promise<void> {
    const license = await this.licenseRepository.findOne({
      where: { partnerId },
    });
    if (!license || license.status !== CustomsLicenseStatus.ACTIVE) {
      throw new ForbiddenException(
        'No cuenta con una licencia de agente de aduanas activa',
      );
    }
  }

  // ---- Declaración -----------------------------------------------------------

  async createDeclaration(
    dto: CreateDeclarationDto,
    actor: RequestUser,
  ): Promise<CustomsDeclaration> {
    if (!actor.groupCodes.includes('admin')) {
      await this.assertActiveLicense(actor.partnerId);
      const isAgentOfCase = await this.casePartyRepository.findOne({
        where: {
          caseId: dto.caseId,
          partnerId: actor.partnerId,
          role: CasePartyRole.AGENT,
        },
      });
      if (!isAgentOfCase) {
        throw new ForbiddenException(
          'No está registrado como agente de este expediente',
        );
      }
    }

    return this.declarationRepository.save(
      this.declarationRepository.create({
        caseId: dto.caseId,
        customsAgentPartnerId: actor.partnerId,
        description: dto.description ?? null,
        status: CustomsDeclarationStatus.DRAFT,
      }),
    );
  }

  async getDeclarationForActor(
    id: number,
    actor: RequestUser,
  ): Promise<CustomsDeclaration> {
    const declaration = await this.declarationRepository.findOne({
      where: { id },
    });
    if (!declaration) throw new NotFoundException('Declaración no encontrada');
    this.assertOwnsDeclaration(declaration, actor);
    return declaration;
  }

  async listMyDeclarations(
    actor: RequestUser,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<CustomsDeclaration>> {
    const [data, total] = await this.declarationRepository.findAndCount({
      where: { customsAgentPartnerId: actor.partnerId },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async addItem(
    declarationId: number,
    dto: AddDeclarationItemDto,
    actor: RequestUser,
  ): Promise<CustomsDeclarationItem> {
    const declaration = await this.getDeclarationForActor(declarationId, actor);
    if (declaration.status !== CustomsDeclarationStatus.DRAFT) {
      throw new BadRequestException(
        'Solo se pueden agregar ítems mientras la declaración está en borrador',
      );
    }

    const subtotal = (Number(dto.quantity) * Number(dto.unitValue)).toFixed(2);
    return this.declarationItemRepository.save(
      this.declarationItemRepository.create({
        customsDeclarationId: declarationId,
        description: dto.description,
        tariffCode: dto.tariffCode ?? null,
        quantity: dto.quantity,
        unitValue: dto.unitValue,
        subtotal,
      }),
    );
  }

  async listItems(
    declarationId: number,
    actor: RequestUser,
  ): Promise<CustomsDeclarationItem[]> {
    await this.getDeclarationForActor(declarationId, actor);
    return this.declarationItemRepository.find({
      where: { customsDeclarationId: declarationId },
    });
  }

  async assignRegime(
    declarationId: number,
    dto: AssignRegimeDto,
    actor: RequestUser,
  ): Promise<CustomsRegimeAssignment> {
    const declaration = await this.getDeclarationForActor(declarationId, actor);
    await this.sidUneaService.getCustomsRegime(dto.customsRegimeId);

    const existing = await this.regimeAssignmentRepository.findOne({
      where: { customsDeclarationId: declaration.id },
    });
    if (existing) {
      existing.customsRegimeId = dto.customsRegimeId;
      existing.assignedAt = new Date();
      existing.assignedById = actor.id;
      return this.regimeAssignmentRepository.save(existing);
    }

    return this.regimeAssignmentRepository.save(
      this.regimeAssignmentRepository.create({
        customsDeclarationId: declaration.id,
        customsRegimeId: dto.customsRegimeId,
        assignedAt: new Date(),
        assignedById: actor.id,
      }),
    );
  }

  async getRegimeAssignment(
    declarationId: number,
    actor: RequestUser,
  ): Promise<CustomsRegimeAssignment> {
    await this.getDeclarationForActor(declarationId, actor);
    const assignment = await this.regimeAssignmentRepository.findOne({
      where: { customsDeclarationId: declarationId },
    });
    if (!assignment) {
      throw new NotFoundException('Aún no se ha asignado un régimen aduanero');
    }
    return assignment;
  }

  // ---- Liquidación ---------------------------------------------------------------

  async createLiquidation(
    declarationId: number,
    dto: CreateLiquidationDto,
    actor: RequestUser,
  ): Promise<CustomsTaxLiquidation> {
    const declaration = await this.getDeclarationForActor(declarationId, actor);

    const existing = await this.liquidationRepository.findOne({
      where: { customsDeclarationId: declaration.id },
    });
    const liquidation = existing
      ? Object.assign(existing, {
          totalTaxes: dto.totalTaxes,
          totalDuties: dto.totalDuties ?? null,
          currencyId: dto.currencyId,
          details: dto.details ?? null,
          calculatedAt: new Date(),
        })
      : this.liquidationRepository.create({
          customsDeclarationId: declaration.id,
          totalTaxes: dto.totalTaxes,
          totalDuties: dto.totalDuties ?? null,
          currencyId: dto.currencyId,
          details: dto.details ?? null,
          calculatedAt: new Date(),
        });
    const saved = await this.liquidationRepository.save(liquidation);

    declaration.status = CustomsDeclarationStatus.SUBMITTED;
    declaration.declaredAt = new Date();
    await this.declarationRepository.save(declaration);

    return saved;
  }

  async getLiquidation(
    declarationId: number,
    actor: RequestUser,
  ): Promise<CustomsTaxLiquidation> {
    await this.getDeclarationForActor(declarationId, actor);
    const liquidation = await this.liquidationRepository.findOne({
      where: { customsDeclarationId: declarationId },
    });
    if (!liquidation) throw new NotFoundException('Liquidación no encontrada');
    return liquidation;
  }

  private assertOwnsDeclaration(
    declaration: CustomsDeclaration,
    actor: RequestUser,
  ): void {
    if (actor.groupCodes.includes('admin')) return;
    if (declaration.customsAgentPartnerId !== actor.partnerId) {
      throw new ForbiddenException('No tiene acceso a esta declaración');
    }
  }
}
