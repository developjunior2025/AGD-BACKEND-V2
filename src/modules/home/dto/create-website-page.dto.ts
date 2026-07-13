import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WebsitePageType } from '../entities/website-page.entity';

export class CreateWebsitePageDto {
  @IsString()
  @MaxLength(128)
  slug: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsEnum(WebsitePageType)
  pageType?: WebsitePageType;
}
