import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ModelName } from '../../common/constants/model-names';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreatePolicyVersionDto } from './dto/create-policy-version.dto';
import { CreatePortalVersionDto } from './dto/create-portal-version.dto';
import { CreateWebsiteMenuDto } from './dto/create-website-menu.dto';
import { CreateWebsitePageDto } from './dto/create-website-page.dto';
import { TrackVisitDto } from './dto/track-visit.dto';
import { WebsitePageType } from './entities/website-page.entity';
import { HomeService } from './home.service';

@ApiTags('home')
@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('public/home')
  getWebsite() {
    return this.homeService.getWebsite();
  }

  @Public()
  @Get('public/notices')
  listNotices() {
    return this.homeService.listPublishedPages(WebsitePageType.NOTICE);
  }

  @Public()
  @Get('public/pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.homeService.getPublishedPageBySlug(slug);
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'create')
  @Post('public/pages')
  createPage(@Body() dto: CreateWebsitePageDto) {
    return this.homeService.createPage(dto);
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'write')
  @Post('public/pages/:id/publish')
  publishPage(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.publishPage(id);
  }

  @Public()
  @Get('public/menu')
  listMenu() {
    return this.homeService.listMenu();
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'create')
  @Post('public/menu')
  createMenuItem(@Body() dto: CreateWebsiteMenuDto) {
    return this.homeService.createMenuItem(dto);
  }

  @Public()
  @Post('public/track-visit')
  trackVisit(@Body() dto: TrackVisitDto, @Req() req: Request) {
    return this.homeService.trackVisit(dto, req.ip ?? null);
  }

  @Public()
  @Get('public/policies')
  listPolicies() {
    return this.homeService.listPolicies();
  }

  @Public()
  @Get('public/policies/:id/current')
  getCurrentPolicyVersion(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getCurrentPolicyVersion(id);
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'read')
  @Get('public/policies/:id/versions')
  listPolicyVersions(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.listPolicyVersions(id);
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'create')
  @Post('public/policies/:id/versions')
  createPolicyVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePolicyVersionDto,
  ) {
    return this.homeService.createPolicyVersion(id, dto);
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'write')
  @Post('public/policy-versions/:id/publish')
  publishPolicyVersion(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.publishPolicyVersion(id);
  }

  @Public()
  @Get('public/portal-versions')
  listPortalVersions() {
    return this.homeService.listPortalVersions();
  }

  @RequirePermission(ModelName.HOME_CONTENT, 'create')
  @Post('public/portal-versions')
  createPortalVersion(@Body() dto: CreatePortalVersionDto) {
    return this.homeService.createPortalVersion(dto);
  }

  @Public()
  @Post('public/leads')
  createLead(@Body() dto: CreateLeadDto) {
    return this.homeService.createLead(dto);
  }

  @RequirePermission(ModelName.CRM_LEAD, 'read')
  @Get('public/leads')
  listLeads(@Query() query: PaginationQueryDto) {
    return this.homeService.listLeads(query);
  }
}
