import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ProductTemplate } from '../catalog/entities/product-template.entity';
import { CreatePublicationVersionDto } from './dto/create-publication-version.dto';
import { CreateServiceCoverageDto } from './dto/create-service-coverage.dto';
import { CreateServiceEvidenceTypeDto } from './dto/create-service-evidence-type.dto';
import { CreateServiceRequirementDto } from './dto/create-service-requirement.dto';
import { CreateServiceSlaDto } from './dto/create-service-sla.dto';
import { ServiceCoverage } from './entities/service-coverage.entity';
import { ServiceEvidenceType } from './entities/service-evidence-type.entity';
import {
  ServicePublicationVersion,
  ServicePublicationVersionStatus,
} from './entities/service-publication-version.entity';
import {
  ServicePublication,
  ServicePublicationStatus,
} from './entities/service-publication.entity';
import { ServiceRequirement } from './entities/service-requirement.entity';
import { ServiceSla } from './entities/service-sla.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ProductTemplate)
    private readonly productTemplateRepository: Repository<ProductTemplate>,
    @InjectRepository(ServiceRequirement)
    private readonly serviceRequirementRepository: Repository<ServiceRequirement>,
    @InjectRepository(ServiceSla)
    private readonly serviceSlaRepository: Repository<ServiceSla>,
    @InjectRepository(ServiceCoverage)
    private readonly serviceCoverageRepository: Repository<ServiceCoverage>,
    @InjectRepository(ServiceEvidenceType)
    private readonly serviceEvidenceTypeRepository: Repository<ServiceEvidenceType>,
    @InjectRepository(ServicePublication)
    private readonly servicePublicationRepository: Repository<ServicePublication>,
    @InjectRepository(ServicePublicationVersion)
    private readonly servicePublicationVersionRepository: Repository<ServicePublicationVersion>,
  ) {}

  async listPublishedServices(
    query: PaginationQueryDto,
    categoryId?: number,
  ): Promise<PaginatedResponseDto<ProductTemplate>> {
    const qb = this.servicePublicationRepository
      .createQueryBuilder('publication')
      .innerJoinAndSelect('publication.productTemplate', 'service')
      .where('publication.status = :status', {
        status: ServicePublicationStatus.PUBLISHED,
      });
    if (categoryId) {
      qb.andWhere('service.categoryId = :categoryId', { categoryId });
    }
    qb.orderBy('publication.createdAt', query.order)
      .skip(query.skip)
      .take(query.limit);

    const [publications, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(
      publications.map((publication) => publication.productTemplate),
      total,
      query.page,
      query.limit,
    );
  }

  async getPublishedService(
    productTemplateId: number,
  ): Promise<ProductTemplate> {
    const publication = await this.assertPublished(productTemplateId);
    return publication.productTemplate;
  }

  async listSla(productTemplateId: number): Promise<ServiceSla[]> {
    await this.assertPublished(productTemplateId);
    return this.serviceSlaRepository.find({
      where: { productTemplateId, active: true },
    });
  }

  async listCoverage(productTemplateId: number): Promise<ServiceCoverage[]> {
    await this.assertPublished(productTemplateId);
    return this.serviceCoverageRepository.find({
      where: { productTemplateId, active: true },
    });
  }

  async listRequirements(
    productTemplateId: number,
  ): Promise<ServiceRequirement[]> {
    await this.assertPublished(productTemplateId);
    return this.serviceRequirementRepository.find({
      where: { productTemplateId, active: true },
    });
  }

  createRequirement(
    dto: CreateServiceRequirementDto,
  ): Promise<ServiceRequirement> {
    return this.serviceRequirementRepository.save(
      this.serviceRequirementRepository.create(dto),
    );
  }

  createSla(dto: CreateServiceSlaDto): Promise<ServiceSla> {
    return this.serviceSlaRepository.save(
      this.serviceSlaRepository.create(dto),
    );
  }

  createCoverage(dto: CreateServiceCoverageDto): Promise<ServiceCoverage> {
    return this.serviceCoverageRepository.save(
      this.serviceCoverageRepository.create(dto),
    );
  }

  listEvidenceTypes(): Promise<ServiceEvidenceType[]> {
    return this.serviceEvidenceTypeRepository.find({ where: { active: true } });
  }

  createEvidenceType(
    dto: CreateServiceEvidenceTypeDto,
  ): Promise<ServiceEvidenceType> {
    return this.serviceEvidenceTypeRepository.save(
      this.serviceEvidenceTypeRepository.create(dto),
    );
  }

  async getPublicationStatus(
    productTemplateId: number,
  ): Promise<ServicePublication | null> {
    return this.servicePublicationRepository.findOne({
      where: { productTemplateId },
    });
  }

  async listPublicationVersions(
    productTemplateId: number,
  ): Promise<ServicePublicationVersion[]> {
    const publication = await this.getOrCreatePublication(productTemplateId);
    return this.servicePublicationVersionRepository.find({
      where: { servicePublicationId: publication.id },
      order: { versionNumber: 'DESC' },
    });
  }

  async createPublicationVersion(
    productTemplateId: number,
    dto: CreatePublicationVersionDto,
  ): Promise<ServicePublicationVersion> {
    const publication = await this.getOrCreatePublication(productTemplateId);

    const [lastVersion] = await this.servicePublicationVersionRepository.find({
      where: { servicePublicationId: publication.id },
      order: { versionNumber: 'DESC' },
      take: 1,
    });

    return this.servicePublicationVersionRepository.save(
      this.servicePublicationVersionRepository.create({
        servicePublicationId: publication.id,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        status: ServicePublicationVersionStatus.DRAFT,
        content: dto.content,
      }),
    );
  }

  async publishVersion(
    versionId: number,
    publishedById: number,
  ): Promise<ServicePublicationVersion> {
    const version = await this.servicePublicationVersionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException('Versión no encontrada');

    const previousPublished =
      await this.servicePublicationVersionRepository.findOne({
        where: {
          servicePublicationId: version.servicePublicationId,
          status: ServicePublicationVersionStatus.PUBLISHED,
        },
      });
    if (previousPublished) {
      previousPublished.status = ServicePublicationVersionStatus.ARCHIVED;
      await this.servicePublicationVersionRepository.save(previousPublished);
    }

    version.status = ServicePublicationVersionStatus.PUBLISHED;
    version.publishedAt = new Date();
    version.publishedById = publishedById;
    await this.servicePublicationVersionRepository.save(version);

    await this.servicePublicationRepository.update(
      { id: version.servicePublicationId },
      {
        status: ServicePublicationStatus.PUBLISHED,
        publishedAt: version.publishedAt,
        publishedById,
      },
    );

    return version;
  }

  private async getOrCreatePublication(
    productTemplateId: number,
  ): Promise<ServicePublication> {
    const existing = await this.servicePublicationRepository.findOne({
      where: { productTemplateId },
    });
    if (existing) return existing;

    const service = await this.productTemplateRepository.findOne({
      where: { id: productTemplateId },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    return this.servicePublicationRepository.save(
      this.servicePublicationRepository.create({
        productTemplateId,
        status: ServicePublicationStatus.DRAFT,
      }),
    );
  }

  private async assertPublished(
    productTemplateId: number,
  ): Promise<ServicePublication> {
    const publication = await this.servicePublicationRepository.findOne({
      where: {
        productTemplateId,
        status: ServicePublicationStatus.PUBLISHED,
      },
      relations: { productTemplate: true },
    });
    if (!publication) {
      throw new NotFoundException('Servicio no encontrado o no publicado');
    }
    return publication;
  }
}
