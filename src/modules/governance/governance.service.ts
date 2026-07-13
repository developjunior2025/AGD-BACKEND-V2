import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateDocumentProfileMatrixDto } from './dto/create-document-profile-matrix.dto';
import { CreateEscalationMatrixDto } from './dto/create-escalation-matrix.dto';
import { CreateGovernanceMatrixVersionDto } from './dto/create-governance-matrix-version.dto';
import { CreateGovernanceMatrixDto } from './dto/create-governance-matrix.dto';
import { CreateGovernanceWorkflowDto } from './dto/create-governance-workflow.dto';
import { CreateProcessRaciMatrixDto } from './dto/create-process-raci-matrix.dto';
import { CreateRaciAssignmentDto } from './dto/create-raci-assignment.dto';
import { CreateSegregationRuleDto } from './dto/create-segregation-rule.dto';
import { DecideWorkflowInstanceDto } from './dto/decide-workflow-instance.dto';
import { StartWorkflowInstanceDto } from './dto/start-workflow-instance.dto';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { DocumentProfileMatrix } from './entities/document-profile-matrix.entity';
import { EscalationMatrix } from './entities/escalation-matrix.entity';
import {
  GovernanceMatrixVersion,
  GovernanceMatrixVersionStatus,
} from './entities/governance-matrix-version.entity';
import { GovernanceMatrix } from './entities/governance-matrix.entity';
import {
  GovernanceWorkflowInstance,
  WorkflowInstanceStatus,
} from './entities/governance-workflow-instance.entity';
import { GovernanceWorkflow } from './entities/governance-workflow.entity';
import { ModelField } from './entities/model-field.entity';
import { ModelCatalog } from './entities/model-catalog.entity';
import { ProcessRaciMatrix } from './entities/process-raci-matrix.entity';
import { RaciAssignment } from './entities/raci-assignment.entity';
import { SegregationRule } from './entities/segregation-rule.entity';

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(ModelCatalog)
    private readonly modelCatalogRepository: Repository<ModelCatalog>,
    @InjectRepository(ModelField)
    private readonly modelFieldRepository: Repository<ModelField>,
    @InjectRepository(GovernanceMatrix)
    private readonly governanceMatrixRepository: Repository<GovernanceMatrix>,
    @InjectRepository(GovernanceMatrixVersion)
    private readonly governanceMatrixVersionRepository: Repository<GovernanceMatrixVersion>,
    @InjectRepository(DocumentProfileMatrix)
    private readonly documentProfileMatrixRepository: Repository<DocumentProfileMatrix>,
    @InjectRepository(ProcessRaciMatrix)
    private readonly processRaciMatrixRepository: Repository<ProcessRaciMatrix>,
    @InjectRepository(RaciAssignment)
    private readonly raciAssignmentRepository: Repository<RaciAssignment>,
    @InjectRepository(SegregationRule)
    private readonly segregationRuleRepository: Repository<SegregationRule>,
    @InjectRepository(EscalationMatrix)
    private readonly escalationMatrixRepository: Repository<EscalationMatrix>,
    @InjectRepository(GovernanceWorkflow)
    private readonly governanceWorkflowRepository: Repository<GovernanceWorkflow>,
    @InjectRepository(GovernanceWorkflowInstance)
    private readonly workflowInstanceRepository: Repository<GovernanceWorkflowInstance>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  // ---- Matriz de gobernanza -------------------------------------------------

  listMatrices(): Promise<GovernanceMatrix[]> {
    return this.governanceMatrixRepository.find({ where: { active: true } });
  }

  createMatrix(dto: CreateGovernanceMatrixDto): Promise<GovernanceMatrix> {
    return this.governanceMatrixRepository.save(
      this.governanceMatrixRepository.create(dto),
    );
  }

  async listVersions(matrixId: number): Promise<GovernanceMatrixVersion[]> {
    return this.governanceMatrixVersionRepository.find({
      where: { governanceMatrixId: matrixId },
      order: { versionNumber: 'DESC' },
    });
  }

  async getCurrentVersion(
    matrixId: number,
  ): Promise<GovernanceMatrixVersion | null> {
    return this.governanceMatrixVersionRepository.findOne({
      where: {
        governanceMatrixId: matrixId,
        status: GovernanceMatrixVersionStatus.PUBLISHED,
      },
      order: { versionNumber: 'DESC' },
    });
  }

  async createVersion(
    matrixId: number,
    dto: CreateGovernanceMatrixVersionDto,
  ): Promise<GovernanceMatrixVersion> {
    const matrix = await this.governanceMatrixRepository.findOne({
      where: { id: matrixId },
    });
    if (!matrix) throw new NotFoundException('Matriz no encontrada');

    const [lastVersion] = await this.governanceMatrixVersionRepository.find({
      where: { governanceMatrixId: matrixId },
      order: { versionNumber: 'DESC' },
      take: 1,
    });

    return this.governanceMatrixVersionRepository.save(
      this.governanceMatrixVersionRepository.create({
        governanceMatrixId: matrixId,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        status: GovernanceMatrixVersionStatus.DRAFT,
        content: dto.content,
      }),
    );
  }

  async publishVersion(
    versionId: number,
    publishedById: number,
  ): Promise<GovernanceMatrixVersion> {
    const version = await this.governanceMatrixVersionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) throw new NotFoundException('Versión no encontrada');

    const previousPublished =
      await this.governanceMatrixVersionRepository.findOne({
        where: {
          governanceMatrixId: version.governanceMatrixId,
          status: GovernanceMatrixVersionStatus.PUBLISHED,
        },
      });
    if (previousPublished) {
      previousPublished.status = GovernanceMatrixVersionStatus.ARCHIVED;
      await this.governanceMatrixVersionRepository.save(previousPublished);
    }

    version.status = GovernanceMatrixVersionStatus.PUBLISHED;
    version.publishedAt = new Date();
    version.publishedById = publishedById;
    return this.governanceMatrixVersionRepository.save(version);
  }

  // ---- Matriz de documentos por perfil --------------------------------------

  listDocumentProfileMatrix(
    groupId?: number,
  ): Promise<DocumentProfileMatrix[]> {
    return this.documentProfileMatrixRepository.find({
      where: { active: true, ...(groupId ? { groupId } : {}) },
    });
  }

  createDocumentProfileMatrix(
    dto: CreateDocumentProfileMatrixDto,
  ): Promise<DocumentProfileMatrix> {
    return this.documentProfileMatrixRepository.save(
      this.documentProfileMatrixRepository.create(dto),
    );
  }

  /** Usado por el módulo de expedientes para saber qué documentos exigir a un perfil. */
  async getRequirementCodesForGroup(groupId: number): Promise<string[]> {
    const rows = await this.documentProfileMatrixRepository.find({
      where: { groupId, active: true },
      relations: { documentRequirement: true },
    });
    return rows.map((row) => row.documentRequirement.code);
  }

  // ---- RACI ------------------------------------------------------------------

  listProcesses(): Promise<ProcessRaciMatrix[]> {
    return this.processRaciMatrixRepository.find({ where: { active: true } });
  }

  createProcess(dto: CreateProcessRaciMatrixDto): Promise<ProcessRaciMatrix> {
    return this.processRaciMatrixRepository.save(
      this.processRaciMatrixRepository.create(dto),
    );
  }

  listAssignments(processId: number): Promise<RaciAssignment[]> {
    return this.raciAssignmentRepository.find({
      where: { processRaciMatrixId: processId },
    });
  }

  createAssignment(dto: CreateRaciAssignmentDto): Promise<RaciAssignment> {
    return this.raciAssignmentRepository.save(
      this.raciAssignmentRepository.create(dto),
    );
  }

  // ---- Segregación de funciones ----------------------------------------------

  listSegregationRules(): Promise<SegregationRule[]> {
    return this.segregationRuleRepository.find({ where: { active: true } });
  }

  createSegregationRule(
    dto: CreateSegregationRuleDto,
  ): Promise<SegregationRule> {
    if (dto.groupAId === dto.groupBId) {
      throw new BadRequestException(
        'Un perfil no puede ser incompatible consigo mismo',
      );
    }
    const [groupAId, groupBId] = [dto.groupAId, dto.groupBId].sort(
      (a, b) => a - b,
    );
    return this.segregationRuleRepository.save(
      this.segregationRuleRepository.create({
        groupAId,
        groupBId,
        description: dto.description ?? null,
      }),
    );
  }

  /** Lanza si algún par de grupos en la lista está marcado como incompatible. */
  async assertNoSegregationConflict(groupIds: number[]): Promise<void> {
    const rules = await this.segregationRuleRepository.find({
      where: { active: true },
    });
    for (const rule of rules) {
      if (
        groupIds.includes(rule.groupAId) &&
        groupIds.includes(rule.groupBId)
      ) {
        throw new ConflictException(
          `Los perfiles ${rule.groupAId} y ${rule.groupBId} son incompatibles por segregación de funciones`,
        );
      }
    }
  }

  // ---- Escalamiento -----------------------------------------------------------

  listEscalationRules(): Promise<EscalationMatrix[]> {
    return this.escalationMatrixRepository.find({ where: { active: true } });
  }

  createEscalationRule(
    dto: CreateEscalationMatrixDto,
  ): Promise<EscalationMatrix> {
    return this.escalationMatrixRepository.save(
      this.escalationMatrixRepository.create(dto),
    );
  }

  // ---- Workflows ---------------------------------------------------------------

  listWorkflows(): Promise<GovernanceWorkflow[]> {
    return this.governanceWorkflowRepository.find({ where: { active: true } });
  }

  createWorkflow(
    dto: CreateGovernanceWorkflowDto,
  ): Promise<GovernanceWorkflow> {
    return this.governanceWorkflowRepository.save(
      this.governanceWorkflowRepository.create(dto),
    );
  }

  async startWorkflowInstance(
    dto: StartWorkflowInstanceDto,
  ): Promise<GovernanceWorkflowInstance> {
    const workflow = await this.governanceWorkflowRepository.findOne({
      where: { id: dto.governanceWorkflowId },
    });
    if (!workflow) throw new NotFoundException('Workflow no encontrado');

    return this.workflowInstanceRepository.save(
      this.workflowInstanceRepository.create({
        governanceWorkflowId: workflow.id,
        resModel: dto.resModel,
        resId: dto.resId,
        status: WorkflowInstanceStatus.PENDING,
        startedAt: new Date(),
      }),
    );
  }

  listWorkflowInstances(
    resModel: string,
    resId: number,
  ): Promise<GovernanceWorkflowInstance[]> {
    return this.workflowInstanceRepository.find({
      where: { resModel, resId },
      order: { createdAt: 'DESC' },
    });
  }

  async decideWorkflowInstance(
    instanceId: number,
    dto: DecideWorkflowInstanceDto,
    actorId: number,
  ): Promise<GovernanceWorkflowInstance> {
    const instance = await this.workflowInstanceRepository.findOne({
      where: { id: instanceId },
    });
    if (!instance) throw new NotFoundException('Instancia no encontrada');
    if (instance.status !== WorkflowInstanceStatus.PENDING) {
      throw new BadRequestException('La instancia ya fue decidida');
    }

    instance.status =
      dto.decision === 'approve'
        ? WorkflowInstanceStatus.APPROVED
        : WorkflowInstanceStatus.REJECTED;
    instance.completedAt = new Date();
    instance.decidedById = actorId;
    instance.notes = dto.notes ?? null;
    return this.workflowInstanceRepository.save(instance);
  }

  // ---- Actividades / aprobaciones -----------------------------------------------

  createActivity(dto: CreateActivityDto): Promise<Activity> {
    return this.activityRepository.save(
      this.activityRepository.create({
        ...dto,
        assignedToGroupId: dto.assignedToGroupId ?? null,
        assignedToUserId: dto.assignedToUserId ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      }),
    );
  }

  listActivities(resModel: string, resId: number): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { resModel, resId },
      order: { createdAt: 'DESC' },
    });
  }

  async completeActivity(
    activityId: number,
    dto: CompleteActivityDto,
    actorId: number,
  ): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    if (activity.status !== ActivityStatus.PENDING) {
      throw new BadRequestException('La actividad ya fue resuelta');
    }

    activity.status = ActivityStatus.DONE;
    activity.doneAt = new Date();
    activity.doneById = actorId;
    activity.decision = dto.decision ?? null;
    activity.notes = dto.notes ?? null;
    return this.activityRepository.save(activity);
  }

  // ---- Catálogo de modelos -------------------------------------------------------

  listModels(): Promise<ModelCatalog[]> {
    return this.modelCatalogRepository.find({ where: { active: true } });
  }

  listModelFields(modelId: number): Promise<ModelField[]> {
    return this.modelFieldRepository.find({ where: { modelId } });
  }
}
