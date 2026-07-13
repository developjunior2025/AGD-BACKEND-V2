import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { DocumentRelationType } from '../entities/document-relation.entity';

export class CreateDocumentRelationDto {
  @IsInt()
  sourceDocumentId: number;

  @IsInt()
  targetDocumentId: number;

  @IsEnum(DocumentRelationType)
  relationType: DocumentRelationType;

  @IsOptional()
  @IsString()
  notes?: string;
}
