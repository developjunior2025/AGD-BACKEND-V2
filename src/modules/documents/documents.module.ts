import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { DocumentChecklist } from './entities/document-checklist.entity';
import { DocumentRelation } from './entities/document-relation.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { DocumentStatus } from './entities/document-status.entity';
import { DocumentTag } from './entities/document-tag.entity';
import { Document } from './entities/document.entity';
import { Folder } from './entities/folder.entity';
import { Tag } from './entities/tag.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

const ENTITIES = [
  Document,
  Folder,
  Tag,
  DocumentTag,
  DocumentStatus,
  DocumentRelation,
  DocumentRequirement,
  DocumentChecklist,
];

@Module({
  imports: [IdentityModule, TypeOrmModule.forFeature(ENTITIES)],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [TypeOrmModule.forFeature(ENTITIES), DocumentsService],
})
export class DocumentsModule {}
