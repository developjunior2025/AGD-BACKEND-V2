import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlService } from './access-control.service';
import { AccessRule } from './entities/access-rule.entity';
import { Attachment } from './entities/attachment.entity';
import { ConfigParameter } from './entities/config-parameter.entity';
import { Group } from './entities/group.entity';
import { Message } from './entities/message.entity';
import { ModelAccess } from './entities/model-access.entity';
import { Partner } from './entities/partner.entity';
import { UserGroup } from './entities/user-group.entity';
import { User } from './entities/user.entity';

const ENTITIES = [
  Partner,
  User,
  Group,
  UserGroup,
  ModelAccess,
  AccessRule,
  ConfigParameter,
  Attachment,
  Message,
];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  providers: [AccessControlService],
  exports: [TypeOrmModule.forFeature(ENTITIES), AccessControlService],
})
export class IdentityModule {}
