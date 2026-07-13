import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from '../documents/documents.module';
import { IdentityModule } from '../identity/identity.module';
import { Activity } from './entities/activity.entity';
import { DocumentProfileMatrix } from './entities/document-profile-matrix.entity';
import { EscalationMatrix } from './entities/escalation-matrix.entity';
import { GovernanceMatrixVersion } from './entities/governance-matrix-version.entity';
import { GovernanceMatrix } from './entities/governance-matrix.entity';
import { GovernanceWorkflowInstance } from './entities/governance-workflow-instance.entity';
import { GovernanceWorkflow } from './entities/governance-workflow.entity';
import { ModelField } from './entities/model-field.entity';
import { ModelCatalog } from './entities/model-catalog.entity';
import { ProcessRaciMatrix } from './entities/process-raci-matrix.entity';
import { RaciAssignment } from './entities/raci-assignment.entity';
import { SegregationRule } from './entities/segregation-rule.entity';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';

const ENTITIES = [
  ModelCatalog,
  ModelField,
  GovernanceMatrix,
  GovernanceMatrixVersion,
  DocumentProfileMatrix,
  ProcessRaciMatrix,
  RaciAssignment,
  SegregationRule,
  EscalationMatrix,
  GovernanceWorkflow,
  GovernanceWorkflowInstance,
  Activity,
];

@Module({
  imports: [
    IdentityModule,
    DocumentsModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [TypeOrmModule.forFeature(ENTITIES), GovernanceService],
})
export class GovernanceModule {}
