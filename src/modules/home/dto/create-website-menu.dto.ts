import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWebsiteMenuDto {
  @IsString()
  @MaxLength(128)
  label: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  pageId?: number;

  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @IsOptional()
  @IsInt()
  sequence?: number;
}
