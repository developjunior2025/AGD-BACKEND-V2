import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreatePolicyVersionDto } from './dto/create-policy-version.dto';
import { CreatePortalVersionDto } from './dto/create-portal-version.dto';
import { CreateWebsiteMenuDto } from './dto/create-website-menu.dto';
import { CreateWebsitePageDto } from './dto/create-website-page.dto';
import { TrackVisitDto } from './dto/track-visit.dto';
import { CrmLead } from './entities/crm-lead.entity';
import {
  LegalPolicyVersion,
  LegalPolicyVersionStatus,
} from './entities/legal-policy-version.entity';
import { LegalPolicy } from './entities/legal-policy.entity';
import { PortalVersion } from './entities/portal-version.entity';
import { Website } from './entities/website.entity';
import { WebsiteMenu } from './entities/website-menu.entity';
import { WebsitePage, WebsitePageType } from './entities/website-page.entity';
import { WebsiteTrack } from './entities/website-track.entity';
import { WebsiteVisitor } from './entities/website-visitor.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Website)
    private readonly websiteRepository: Repository<Website>,
    @InjectRepository(WebsitePage)
    private readonly websitePageRepository: Repository<WebsitePage>,
    @InjectRepository(WebsiteMenu)
    private readonly websiteMenuRepository: Repository<WebsiteMenu>,
    @InjectRepository(WebsiteVisitor)
    private readonly websiteVisitorRepository: Repository<WebsiteVisitor>,
    @InjectRepository(WebsiteTrack)
    private readonly websiteTrackRepository: Repository<WebsiteTrack>,
    @InjectRepository(LegalPolicy)
    private readonly legalPolicyRepository: Repository<LegalPolicy>,
    @InjectRepository(LegalPolicyVersion)
    private readonly legalPolicyVersionRepository: Repository<LegalPolicyVersion>,
    @InjectRepository(PortalVersion)
    private readonly portalVersionRepository: Repository<PortalVersion>,
    @InjectRepository(CrmLead)
    private readonly crmLeadRepository: Repository<CrmLead>,
  ) {}

  async getWebsite(): Promise<Website> {
    const website = await this.websiteRepository.findOne({
      where: { active: true },
    });
    if (!website) throw new NotFoundException('Portal no configurado');
    return website;
  }

  async listPublishedPages(pageType?: WebsitePageType): Promise<WebsitePage[]> {
    return this.websitePageRepository.find({
      where: { isPublished: true, ...(pageType ? { pageType } : {}) },
      order: { publishedAt: 'DESC' },
    });
  }

  async getPublishedPageBySlug(slug: string): Promise<WebsitePage> {
    const page = await this.websitePageRepository.findOne({
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException('Página no encontrada');
    return page;
  }

  async createPage(dto: CreateWebsitePageDto): Promise<WebsitePage> {
    const website = await this.getWebsite();
    return this.websitePageRepository.save(
      this.websitePageRepository.create({
        websiteId: website.id,
        slug: dto.slug,
        title: dto.title,
        body: dto.body,
        pageType: dto.pageType ?? WebsitePageType.GENERIC,
      }),
    );
  }

  async publishPage(pageId: number): Promise<WebsitePage> {
    const page = await this.websitePageRepository.findOne({
      where: { id: pageId },
    });
    if (!page) throw new NotFoundException('Página no encontrada');
    page.isPublished = true;
    page.publishedAt = new Date();
    return this.websitePageRepository.save(page);
  }

  async listMenu(): Promise<WebsiteMenu[]> {
    return this.websiteMenuRepository.find({
      where: { active: true },
      order: { sequence: 'ASC' },
    });
  }

  async createMenuItem(dto: CreateWebsiteMenuDto): Promise<WebsiteMenu> {
    const website = await this.getWebsite();
    return this.websiteMenuRepository.save(
      this.websiteMenuRepository.create({
        websiteId: website.id,
        label: dto.label,
        parentId: dto.parentId ?? null,
        pageId: dto.pageId ?? null,
        isExternal: dto.isExternal ?? false,
        externalUrl: dto.externalUrl ?? null,
        sequence: dto.sequence ?? 0,
      }),
    );
  }

  /** Registra una visita anónima; devuelve el token de sesión (nuevo si no venía). */
  async trackVisit(
    dto: TrackVisitDto,
    ipAddress: string | null,
  ): Promise<{ sessionToken: string }> {
    const sessionToken = dto.sessionToken ?? randomUUID();
    const now = new Date();

    let visitor = await this.websiteVisitorRepository.findOne({
      where: { sessionToken },
    });
    if (!visitor) {
      visitor = await this.websiteVisitorRepository.save(
        this.websiteVisitorRepository.create({
          sessionToken,
          firstVisitAt: now,
          lastVisitAt: now,
          ipAddress,
        }),
      );
    } else {
      visitor.lastVisitAt = now;
      await this.websiteVisitorRepository.save(visitor);
    }

    await this.websiteTrackRepository.insert({
      visitorId: visitor.id,
      url: dto.url,
      visitedAt: now,
    });

    return { sessionToken };
  }

  listPolicies(): Promise<LegalPolicy[]> {
    return this.legalPolicyRepository.find({ where: { active: true } });
  }

  async getCurrentPolicyVersion(
    policyId: number,
  ): Promise<LegalPolicyVersion | null> {
    return this.legalPolicyVersionRepository.findOne({
      where: {
        legalPolicyId: policyId,
        status: LegalPolicyVersionStatus.PUBLISHED,
      },
      order: { createdAt: 'DESC' },
    });
  }

  listPolicyVersions(policyId: number): Promise<LegalPolicyVersion[]> {
    return this.legalPolicyVersionRepository.find({
      where: { legalPolicyId: policyId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPolicyVersion(
    policyId: number,
    dto: CreatePolicyVersionDto,
  ): Promise<LegalPolicyVersion> {
    const policy = await this.legalPolicyRepository.findOne({
      where: { id: policyId },
    });
    if (!policy) throw new NotFoundException('Política no encontrada');

    return this.legalPolicyVersionRepository.save(
      this.legalPolicyVersionRepository.create({
        legalPolicyId: policyId,
        versionLabel: dto.versionLabel,
        content: dto.content,
        status: LegalPolicyVersionStatus.DRAFT,
      }),
    );
  }

  async publishPolicyVersion(versionId: number): Promise<LegalPolicyVersion> {
    const version = await this.legalPolicyVersionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException('Versión no encontrada');

    const previousPublished = await this.legalPolicyVersionRepository.findOne({
      where: {
        legalPolicyId: version.legalPolicyId,
        status: LegalPolicyVersionStatus.PUBLISHED,
      },
    });
    if (previousPublished) {
      previousPublished.status = LegalPolicyVersionStatus.ARCHIVED;
      await this.legalPolicyVersionRepository.save(previousPublished);
    }

    version.status = LegalPolicyVersionStatus.PUBLISHED;
    version.publishedAt = new Date();
    return this.legalPolicyVersionRepository.save(version);
  }

  listPortalVersions(): Promise<PortalVersion[]> {
    return this.portalVersionRepository.find({ order: { releasedAt: 'DESC' } });
  }

  createPortalVersion(dto: CreatePortalVersionDto): Promise<PortalVersion> {
    return this.portalVersionRepository.save(
      this.portalVersionRepository.create({
        versionLabel: dto.versionLabel,
        releaseNotes: dto.releaseNotes ?? null,
        releasedAt: new Date(),
      }),
    );
  }

  createLead(dto: CreateLeadDto): Promise<CrmLead> {
    return this.crmLeadRepository.save(this.crmLeadRepository.create(dto));
  }

  async listLeads(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<CrmLead>> {
    const [data, total] = await this.crmLeadRepository.findAndCount({
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }
}
