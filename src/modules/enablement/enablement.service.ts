import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelName } from '../../common/constants/model-names';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { normalizeRif } from '../../common/utils/rif.util';
import { AuthService } from '../auth/auth.service';
import { Attachment } from '../identity/entities/attachment.entity';
import { Group } from '../identity/entities/group.entity';
import { Message, MessageType } from '../identity/entities/message.entity';
import { Partner } from '../identity/entities/partner.entity';
import { UserGroup } from '../identity/entities/user-group.entity';
import { User } from '../identity/entities/user.entity';
import { RequestUser } from '../identity/interfaces/request-user.interface';
import { AcceptPolicyDto } from './dto/accept-policy.dto';
import { RegisterEnablementDto } from './dto/register-enablement.dto';
import { ReviewStepDto } from './dto/review-step.dto';
import {
  EnablementRequest,
  EnablementRequestStatus,
} from './entities/enablement-request.entity';
import {
  ENABLEMENT_STEP_ORDER,
  EnablementStep,
  EnablementStepCode,
  EnablementStepStatus,
} from './entities/enablement-step.entity';
import { PolicyAcceptance } from './entities/policy-acceptance.entity';
import { TrainingAcceptance } from './entities/training-acceptance.entity';

const ADMIN_REVIEW_STEPS = new Set([
  EnablementStepCode.VERIFICACION,
  EnablementStepCode.VALIDACION_DOCUMENTOS,
  EnablementStepCode.ASIGNACION_PERFIL,
  EnablementStepCode.ASIGNACION_ROLES,
]);

@Injectable()
export class EnablementService {
  constructor(
    @InjectRepository(EnablementRequest)
    private readonly requestRepository: Repository<EnablementRequest>,
    @InjectRepository(EnablementStep)
    private readonly stepRepository: Repository<EnablementStep>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(PolicyAcceptance)
    private readonly policyAcceptanceRepository: Repository<PolicyAcceptance>,
    @InjectRepository(TrainingAcceptance)
    private readonly trainingAcceptanceRepository: Repository<TrainingAcceptance>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly authService: AuthService,
  ) {}

  async register(dto: RegisterEnablementDto): Promise<EnablementRequest> {
    const rif = normalizeRif(dto.rif);

    const group = await this.groupRepository.findOne({
      where: {
        code: dto.requestedProfile,
        isEnablementProfile: true,
        active: true,
      },
    });
    if (!group) {
      throw new BadRequestException(
        'Perfil solicitado no disponible para autoservicio',
      );
    }

    let partner = await this.partnerRepository.findOne({
      where: [{ rif }, { email: dto.email }],
    });

    if (partner) {
      const existingRequest = await this.requestRepository.findOne({
        where: {
          partnerId: partner.id,
          status: EnablementRequestStatus.IN_REVIEW,
        },
      });
      if (existingRequest) {
        throw new ConflictException(
          'Ya existe una solicitud de habilitación en curso para este RIF o correo',
        );
      }
    } else {
      partner = await this.partnerRepository.save(
        this.partnerRepository.create({
          kind: dto.kind,
          firstName: dto.firstName ?? null,
          lastName: dto.lastName ?? null,
          legalName: dto.legalName ?? null,
          rif,
          email: dto.email,
          phone: dto.phone ?? null,
          address: dto.address ?? null,
          active: true,
        }),
      );
    }

    const request = await this.requestRepository.save(
      this.requestRepository.create({
        partnerId: partner.id,
        requestedGroupId: group.id,
        status: EnablementRequestStatus.IN_REVIEW,
        currentStep: 2,
        submittedAt: new Date(),
      }),
    );

    await this.createSteps(request.id);
    await this.audit(
      request.id,
      `Solicitud de habilitación creada (perfil ${group.code})`,
    );

    return this.getByIdForAdmin(request.id);
  }

  async getByIdForOwner(id: number, rif: string): Promise<EnablementRequest> {
    const request = await this.getByIdForAdmin(id);
    if (normalizeRif(request.partner.rif) !== normalizeRif(rif)) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return request;
  }

  async getByIdForAdmin(id: number): Promise<EnablementRequest> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    await this.syncPasswordStep(request);
    return request;
  }

  async listForAdmin(
    query: PaginationQueryDto,
    status?: EnablementRequestStatus,
  ): Promise<PaginatedResponseDto<EnablementRequest>> {
    const [data, total] = await this.requestRepository.findAndCount({
      where: status ? { status } : {},
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async getSteps(requestId: number): Promise<EnablementStep[]> {
    return this.stepRepository.find({
      where: { requestId },
      order: { stepNumber: 'ASC' },
    });
  }

  async uploadDocument(
    requestId: number,
    rif: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    },
  ): Promise<Attachment> {
    await this.getByIdForOwner(requestId, rif);
    return this.attachmentRepository.save(
      this.attachmentRepository.create({
        resModel: ModelName.ENABLEMENT_REQUEST,
        resId: requestId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey: file.path,
        uploadedById: null,
      }),
    );
  }

  async acceptPolicy(
    dto: AcceptPolicyDto,
    ipAddress: string | null,
  ): Promise<void> {
    const rif = normalizeRif(dto.rif);
    const partner = await this.partnerRepository.findOne({ where: { rif } });
    if (!partner) throw new NotFoundException('Solicitante no encontrado');

    const existing = await this.policyAcceptanceRepository.findOne({
      where: {
        partnerId: partner.id,
        policyCode: dto.policyCode,
        policyVersion: dto.policyVersion,
      },
    });
    if (existing) return;

    await this.policyAcceptanceRepository.insert({
      partnerId: partner.id,
      policyCode: dto.policyCode,
      policyVersion: dto.policyVersion,
      acceptedAt: new Date(),
      ipAddress,
    });
  }

  async reviewStep(
    requestId: number,
    stepCode: EnablementStepCode,
    dto: ReviewStepDto,
    actor: RequestUser,
  ): Promise<EnablementRequest> {
    if (!ADMIN_REVIEW_STEPS.has(stepCode)) {
      throw new BadRequestException(
        `El paso '${stepCode}' no es revisable manualmente`,
      );
    }

    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.status !== EnablementRequestStatus.IN_REVIEW) {
      throw new BadRequestException('La solicitud ya fue decidida');
    }

    const expectedStepCode = ENABLEMENT_STEP_ORDER[request.currentStep - 1];
    if (expectedStepCode !== stepCode) {
      throw new BadRequestException(
        `Paso fuera de orden: se esperaba '${expectedStepCode}'`,
      );
    }

    const step = await this.stepRepository.findOne({
      where: { requestId, stepCode },
    });
    if (!step) throw new NotFoundException('Paso no encontrado');

    if (dto.decision === 'reject') {
      request.status = EnablementRequestStatus.REJECTED;
      request.decidedAt = new Date();
      request.decidedById = actor.id;
      request.rejectionReason = dto.notes ?? null;
      request.rejectedAtStep = request.currentStep;
      step.notes = dto.notes ?? null;
      await this.stepRepository.save(step);
      await this.requestRepository.save(request);
      await this.audit(
        request.id,
        `Solicitud rechazada en paso '${stepCode}': ${dto.notes ?? 's/n'}`,
      );
      return request;
    }

    if (stepCode === EnablementStepCode.ASIGNACION_PERFIL && dto.groupCode) {
      const group = await this.groupRepository.findOne({
        where: { code: dto.groupCode, isEnablementProfile: true, active: true },
      });
      if (!group) throw new BadRequestException('Perfil de reemplazo inválido');
      request.requestedGroupId = group.id;
    }

    step.status = EnablementStepStatus.DONE;
    step.completedAt = new Date();
    step.completedById = actor.id;
    step.notes = dto.notes ?? null;
    await this.stepRepository.save(step);

    request.currentStep += 1;
    await this.requestRepository.save(request);

    if (stepCode === EnablementStepCode.ASIGNACION_ROLES) {
      await this.autoCreateAccount(request, actor.id);
    }

    return this.requestRepository.findOneOrFail({ where: { id: requestId } });
  }

  async acceptTraining(user: RequestUser): Promise<EnablementRequest> {
    const request = await this.requestRepository.findOne({
      where: { userId: user.id },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.status !== EnablementRequestStatus.IN_REVIEW) {
      throw new BadRequestException('La solicitud ya fue decidida');
    }

    await this.syncPasswordStep(request);

    if (request.currentStep !== 8) {
      throw new BadRequestException(
        'Debe completar el cambio de contraseña antes de aceptar el rol',
      );
    }

    const existing = await this.trainingAcceptanceRepository.findOne({
      where: { userId: user.id },
    });
    if (!existing) {
      await this.trainingAcceptanceRepository.insert({
        userId: user.id,
        groupId: request.requestedGroupId,
        acceptedAt: new Date(),
      });
    }

    await this.markStepDone(
      request.id,
      EnablementStepCode.CAPACITACION,
      user.id,
    );
    request.currentStep = 9;
    await this.requestRepository.save(request);

    await this.activateAccount(request);

    return this.requestRepository.findOneOrFail({ where: { id: request.id } });
  }

  private async autoCreateAccount(
    request: EnablementRequest,
    actorId: number,
  ): Promise<void> {
    const partner = await this.partnerRepository.findOneOrFail({
      where: { id: request.partnerId },
    });
    const { user, tempPassword } =
      await this.authService.createUserWithTempPassword(
        partner.id,
        partner.email,
      );

    await this.userGroupRepository.insert({
      userId: user.id,
      groupId: request.requestedGroupId,
    });

    request.userId = user.id;
    request.currentStep = 7;
    await this.requestRepository.save(request);

    // Sin proveedor de correo/SMS real (backend standalone), la contraseña
    // temporal se entrega a través del propio seguimiento de la solicitud
    // (visible al titular vía GET /:id?rif=... y al admin vía /:id/admin).
    // Una integración de notificaciones reemplazaría esto en una fase futura.
    await this.markStepDone(
      request.id,
      EnablementStepCode.CREACION_CUENTA,
      actorId,
      `Cuenta creada automáticamente. Contraseña temporal (un solo uso, cámbiela al iniciar sesión): ${tempPassword}`,
    );
    await this.audit(
      request.id,
      `Cuenta de usuario creada (user_id=${user.id})`,
    );
  }

  private async activateAccount(request: EnablementRequest): Promise<void> {
    if (!request.userId) {
      throw new BadRequestException('La solicitud no tiene cuenta asociada');
    }
    await this.userRepository.update({ id: request.userId }, { active: true });

    request.status = EnablementRequestStatus.ACTIVE;
    request.decidedAt = new Date();
    await this.requestRepository.save(request);

    await this.markStepDone(request.id, EnablementStepCode.ACTIVACION, null);
    await this.audit(request.id, 'Cuenta activada — habilitación completada');
  }

  /** Paso 7 (cambio de contraseña) se deriva de must_change_password del usuario. */
  private async syncPasswordStep(request: EnablementRequest): Promise<void> {
    if (
      request.status !== EnablementRequestStatus.IN_REVIEW ||
      request.currentStep !== 7 ||
      !request.userId
    ) {
      return;
    }

    const user = await this.userRepository.findOne({
      where: { id: request.userId },
    });
    if (!user || user.mustChangePassword) return;

    await this.markStepDone(
      request.id,
      EnablementStepCode.CAMBIO_PASSWORD,
      null,
      'Confirmado automáticamente al cambiar la contraseña inicial',
    );
    request.currentStep = 8;
    await this.requestRepository.save(request);
  }

  private async markStepDone(
    requestId: number,
    stepCode: EnablementStepCode,
    actorId: number | null,
    notes?: string,
  ): Promise<void> {
    await this.stepRepository.update(
      { requestId, stepCode },
      {
        status: EnablementStepStatus.DONE,
        completedAt: new Date(),
        completedById: actorId,
        notes: notes ?? null,
      },
    );
  }

  private async createSteps(requestId: number): Promise<void> {
    const now = new Date();
    const rows = ENABLEMENT_STEP_ORDER.map((stepCode, index) =>
      this.stepRepository.create({
        requestId,
        stepNumber: index + 1,
        stepCode,
        status:
          stepCode === EnablementStepCode.SOLICITUD
            ? EnablementStepStatus.DONE
            : EnablementStepStatus.PENDING,
        completedAt: stepCode === EnablementStepCode.SOLICITUD ? now : null,
      }),
    );
    await this.stepRepository.save(rows);
  }

  private async audit(requestId: number, body: string): Promise<void> {
    await this.messageRepository.insert({
      resModel: ModelName.ENABLEMENT_REQUEST,
      resId: requestId,
      messageType: MessageType.AUDIT,
      body,
      authorId: null,
      ipAddress: null,
    });
  }
}
