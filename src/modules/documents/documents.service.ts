import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../identity/entities/attachment.entity';
import { CreateDocumentRelationDto } from './dto/create-document-relation.dto';
import { CreateDocumentRequirementDto } from './dto/create-document-requirement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { DocumentChecklist } from './entities/document-checklist.entity';
import { DocumentRelation } from './entities/document-relation.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';
import {
  DocumentReviewStatus,
  DocumentStatus,
} from './entities/document-status.entity';
import { DocumentTag } from './entities/document-tag.entity';
import { Document } from './entities/document.entity';
import { Tag } from './entities/tag.entity';

export interface UploadedFileMeta {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentStatus)
    private readonly documentStatusRepository: Repository<DocumentStatus>,
    @InjectRepository(DocumentTag)
    private readonly documentTagRepository: Repository<DocumentTag>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(DocumentRelation)
    private readonly documentRelationRepository: Repository<DocumentRelation>,
    @InjectRepository(DocumentRequirement)
    private readonly documentRequirementRepository: Repository<DocumentRequirement>,
    @InjectRepository(DocumentChecklist)
    private readonly documentChecklistRepository: Repository<DocumentChecklist>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async upload(
    resModel: string,
    resId: number,
    file: UploadedFileMeta,
    uploadedById: number | null,
    folderId: number | null,
  ): Promise<Document> {
    const attachment = await this.attachmentRepository.save(
      this.attachmentRepository.create({
        resModel,
        resId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey: file.path,
        uploadedById,
      }),
    );

    const document = await this.documentRepository.save(
      this.documentRepository.create({
        name: file.originalname,
        folderId,
        attachmentId: attachment.id,
        resModel,
        resId,
        active: true,
      }),
    );

    await this.documentStatusRepository.insert({
      documentId: document.id,
      status: DocumentReviewStatus.SUBMITTED,
    });

    return document;
  }

  listByContext(resModel: string, resId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { resModel, resId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async reviewDocument(
    documentId: number,
    dto: ReviewDocumentDto,
    actorId: number,
  ): Promise<DocumentStatus> {
    const status = await this.documentStatusRepository.findOne({
      where: { documentId },
    });
    if (!status) throw new NotFoundException('Documento no encontrado');

    status.status =
      dto.decision === 'approve'
        ? DocumentReviewStatus.APPROVED
        : DocumentReviewStatus.REJECTED;
    status.reviewedAt = new Date();
    status.reviewedById = actorId;
    status.notes = dto.notes ?? null;
    return this.documentStatusRepository.save(status);
  }

  listTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  createTag(dto: CreateTagDto): Promise<Tag> {
    return this.tagRepository.save(this.tagRepository.create(dto));
  }

  async tagDocument(documentId: number, tagId: number): Promise<DocumentTag> {
    const existing = await this.documentTagRepository.findOne({
      where: { documentId, tagId },
    });
    if (existing) return existing;
    return this.documentTagRepository.save(
      this.documentTagRepository.create({ documentId, tagId }),
    );
  }

  createRelation(dto: CreateDocumentRelationDto): Promise<DocumentRelation> {
    if (dto.sourceDocumentId === dto.targetDocumentId) {
      throw new BadRequestException(
        'Un documento no puede relacionarse consigo mismo',
      );
    }
    return this.documentRelationRepository.save(
      this.documentRelationRepository.create(dto),
    );
  }

  listRequirements(): Promise<DocumentRequirement[]> {
    return this.documentRequirementRepository.find({
      where: { active: true },
    });
  }

  createRequirement(
    dto: CreateDocumentRequirementDto,
  ): Promise<DocumentRequirement> {
    return this.documentRequirementRepository.save(
      this.documentRequirementRepository.create(dto),
    );
  }

  /** Usado por el módulo de expedientes para instanciar el checklist de un caso. */
  async seedChecklist(
    resModel: string,
    resId: number,
    requirementCodes: string[],
  ): Promise<DocumentChecklist[]> {
    if (requirementCodes.length === 0) return [];

    const requirements = await this.documentRequirementRepository.find({
      where: requirementCodes.map((code) => ({ code, active: true })),
    });

    const rows = requirements.map((requirement) =>
      this.documentChecklistRepository.create({
        resModel,
        resId,
        documentRequirementId: requirement.id,
        fulfilled: false,
      }),
    );
    return this.documentChecklistRepository.save(rows);
  }

  getChecklist(resModel: string, resId: number): Promise<DocumentChecklist[]> {
    return this.documentChecklistRepository.find({
      where: { resModel, resId },
      order: { createdAt: 'ASC' },
    });
  }

  async fulfillChecklistItem(
    checklistId: number,
    documentId: number,
  ): Promise<DocumentChecklist> {
    const item = await this.documentChecklistRepository.findOne({
      where: { id: checklistId },
    });
    if (!item) throw new NotFoundException('Checklist item no encontrado');

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) throw new NotFoundException('Documento no encontrado');

    item.documentId = documentId;
    item.fulfilled = true;
    return this.documentChecklistRepository.save(item);
  }
}
