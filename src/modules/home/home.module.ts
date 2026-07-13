import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmLead } from './entities/crm-lead.entity';
import { LegalPolicyVersion } from './entities/legal-policy-version.entity';
import { LegalPolicy } from './entities/legal-policy.entity';
import { PortalVersion } from './entities/portal-version.entity';
import { Website } from './entities/website.entity';
import { WebsiteMenu } from './entities/website-menu.entity';
import { WebsitePage } from './entities/website-page.entity';
import { WebsiteTrack } from './entities/website-track.entity';
import { WebsiteVisitor } from './entities/website-visitor.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

const ENTITIES = [
  Website,
  WebsitePage,
  WebsiteMenu,
  WebsiteVisitor,
  WebsiteTrack,
  LegalPolicy,
  LegalPolicyVersion,
  PortalVersion,
  CrmLead,
];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [TypeOrmModule.forFeature(ENTITIES), HomeService],
})
export class HomeModule {}
