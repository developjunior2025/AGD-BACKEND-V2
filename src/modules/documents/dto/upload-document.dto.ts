import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { ContextQueryDto } from './context-query.dto';

export class UploadDocumentDto extends ContextQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number;
}
