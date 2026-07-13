import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { ContextQueryDto } from './dto/context-query.dto';
import { CreateDocumentRelationDto } from './dto/create-document-relation.dto';
import { CreateDocumentRequirementDto } from './dto/create-document-requirement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentsService } from './documents.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'documents');

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @RequirePermission(ModelName.DOCUMENT, 'create')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          if (!existsSync(UPLOAD_DIR))
            mkdirSync(UPLOAD_DIR, { recursive: true });
          callback(null, UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  upload(
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) throw new NotFoundException('Archivo no recibido');
    return this.documentsService.upload(
      dto.resModel,
      dto.resId,
      file,
      user.id,
      dto.folderId ?? null,
    );
  }

  @RequirePermission(ModelName.DOCUMENT, 'read')
  @Get()
  listByContext(@Query() query: ContextQueryDto) {
    return this.documentsService.listByContext(query.resModel, query.resId);
  }

  @RequirePermission(ModelName.DOCUMENT, 'write')
  @Patch(':id/review')
  reviewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewDocumentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.reviewDocument(id, dto, user.id);
  }

  @Get('tags')
  listTags() {
    return this.documentsService.listTags();
  }

  @RequirePermission(ModelName.DOCUMENT, 'create')
  @Post('tags')
  createTag(@Body() dto: CreateTagDto) {
    return this.documentsService.createTag(dto);
  }

  @RequirePermission(ModelName.DOCUMENT, 'write')
  @Post(':id/tags/:tagId')
  tagDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.documentsService.tagDocument(id, tagId);
  }

  @RequirePermission(ModelName.DOCUMENT, 'create')
  @Post('relations')
  createRelation(@Body() dto: CreateDocumentRelationDto) {
    return this.documentsService.createRelation(dto);
  }

  @Get('requirements')
  listRequirements() {
    return this.documentsService.listRequirements();
  }

  @RequirePermission(ModelName.DOCUMENT, 'create')
  @Post('requirements')
  createRequirement(@Body() dto: CreateDocumentRequirementDto) {
    return this.documentsService.createRequirement(dto);
  }

  @RequirePermission(ModelName.DOCUMENT, 'read')
  @Get('checklist')
  getChecklist(@Query() query: ContextQueryDto) {
    return this.documentsService.getChecklist(query.resModel, query.resId);
  }

  @RequirePermission(ModelName.DOCUMENT, 'write')
  @Patch('checklist/:id/fulfill')
  fulfillChecklistItem(
    @Param('id', ParseIntPipe) id: number,
    @Body('documentId', ParseIntPipe) documentId: number,
  ) {
    return this.documentsService.fulfillChecklistItem(id, documentId);
  }
}
