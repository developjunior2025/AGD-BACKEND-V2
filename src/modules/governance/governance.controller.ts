import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ContextQueryDto } from '../documents/dto/context-query.dto';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateDocumentProfileMatrixDto } from './dto/create-document-profile-matrix.dto';
import { CreateEscalationMatrixDto } from './dto/create-escalation-matrix.dto';
import { CreateGovernanceMatrixDto } from './dto/create-governance-matrix.dto';
import { CreateGovernanceMatrixVersionDto } from './dto/create-governance-matrix-version.dto';
import { CreateGovernanceWorkflowDto } from './dto/create-governance-workflow.dto';
import { CreateProcessRaciMatrixDto } from './dto/create-process-raci-matrix.dto';
import { CreateRaciAssignmentDto } from './dto/create-raci-assignment.dto';
import { CreateSegregationRuleDto } from './dto/create-segregation-rule.dto';
import { DecideWorkflowInstanceDto } from './dto/decide-workflow-instance.dto';
import { StartWorkflowInstanceDto } from './dto/start-workflow-instance.dto';
import { GovernanceService } from './governance.service';

@ApiTags('governance')
@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('matrices')
  listMatrices() {
    return this.governanceService.listMatrices();
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('matrices')
  createMatrix(@Body() dto: CreateGovernanceMatrixDto) {
    return this.governanceService.createMatrix(dto);
  }

  @Get('matrices/:id/versions')
  listVersions(@Param('id', ParseIntPipe) id: number) {
    return this.governanceService.listVersions(id);
  }

  @Get('matrices/:id/current-version')
  getCurrentVersion(@Param('id', ParseIntPipe) id: number) {
    return this.governanceService.getCurrentVersion(id);
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('matrices/:id/versions')
  createVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGovernanceMatrixVersionDto,
  ) {
    return this.governanceService.createVersion(id, dto);
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'write')
  @Post('matrix-versions/:id/publish')
  publishVersion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.governanceService.publishVersion(id, user.id);
  }

  @Get('document-profile-matrix')
  listDocumentProfileMatrix(@Query('groupId') groupId?: string) {
    return this.governanceService.listDocumentProfileMatrix(
      groupId ? Number(groupId) : undefined,
    );
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('document-profile-matrix')
  createDocumentProfileMatrix(@Body() dto: CreateDocumentProfileMatrixDto) {
    return this.governanceService.createDocumentProfileMatrix(dto);
  }

  @Get('raci/processes')
  listProcesses() {
    return this.governanceService.listProcesses();
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('raci/processes')
  createProcess(@Body() dto: CreateProcessRaciMatrixDto) {
    return this.governanceService.createProcess(dto);
  }

  @Get('raci/processes/:id/assignments')
  listAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.governanceService.listAssignments(id);
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('raci/assignments')
  createAssignment(@Body() dto: CreateRaciAssignmentDto) {
    return this.governanceService.createAssignment(dto);
  }

  @Get('segregation-rules')
  listSegregationRules() {
    return this.governanceService.listSegregationRules();
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('segregation-rules')
  createSegregationRule(@Body() dto: CreateSegregationRuleDto) {
    return this.governanceService.createSegregationRule(dto);
  }

  @Get('escalation-rules')
  listEscalationRules() {
    return this.governanceService.listEscalationRules();
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('escalation-rules')
  createEscalationRule(@Body() dto: CreateEscalationMatrixDto) {
    return this.governanceService.createEscalationRule(dto);
  }

  @Get('workflows')
  listWorkflows() {
    return this.governanceService.listWorkflows();
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('workflows')
  createWorkflow(@Body() dto: CreateGovernanceWorkflowDto) {
    return this.governanceService.createWorkflow(dto);
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'create')
  @Post('workflow-instances')
  startWorkflowInstance(@Body() dto: StartWorkflowInstanceDto) {
    return this.governanceService.startWorkflowInstance(dto);
  }

  @Get('workflow-instances')
  listWorkflowInstances(@Query() query: ContextQueryDto) {
    return this.governanceService.listWorkflowInstances(
      query.resModel,
      query.resId,
    );
  }

  @RequirePermission(ModelName.GOVERNANCE_MATRIX, 'write')
  @Patch('workflow-instances/:id/decide')
  decideWorkflowInstance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DecideWorkflowInstanceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.governanceService.decideWorkflowInstance(id, dto, user.id);
  }

  @Post('activities')
  createActivity(@Body() dto: CreateActivityDto) {
    return this.governanceService.createActivity(dto);
  }

  @Get('activities')
  listActivities(@Query() query: ContextQueryDto) {
    return this.governanceService.listActivities(query.resModel, query.resId);
  }

  @Patch('activities/:id/complete')
  completeActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteActivityDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.governanceService.completeActivity(id, dto, user.id);
  }

  @Get('models')
  listModels() {
    return this.governanceService.listModels();
  }

  @Get('models/:id/fields')
  listModelFields(@Param('id', ParseIntPipe) id: number) {
    return this.governanceService.listModelFields(id);
  }
}
