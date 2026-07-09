import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EnablementRequest } from './enablement-request.entity';

export enum EnablementStepCode {
  SOLICITUD = 'solicitud',
  VERIFICACION = 'verificacion',
  VALIDACION_DOCUMENTOS = 'validacion_documentos',
  ASIGNACION_PERFIL = 'asignacion_perfil',
  ASIGNACION_ROLES = 'asignacion_roles',
  CREACION_CUENTA = 'creacion_cuenta',
  CAMBIO_PASSWORD = 'cambio_password',
  CAPACITACION = 'capacitacion',
  ACTIVACION = 'activacion',
}

export const ENABLEMENT_STEP_ORDER: EnablementStepCode[] = [
  EnablementStepCode.SOLICITUD,
  EnablementStepCode.VERIFICACION,
  EnablementStepCode.VALIDACION_DOCUMENTOS,
  EnablementStepCode.ASIGNACION_PERFIL,
  EnablementStepCode.ASIGNACION_ROLES,
  EnablementStepCode.CREACION_CUENTA,
  EnablementStepCode.CAMBIO_PASSWORD,
  EnablementStepCode.CAPACITACION,
  EnablementStepCode.ACTIVACION,
];

export enum EnablementStepStatus {
  PENDING = 'pending',
  DONE = 'done',
}

/** agd_user_enablement_step — una fila por cada uno de los 9 pasos. */
@Entity('agd_user_enablement_step')
@Index(['requestId', 'stepCode'], { unique: true })
export class EnablementStep extends BaseEntity {
  @ManyToOne(() => EnablementRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: EnablementRequest;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'step_number', type: 'int' })
  stepNumber: number;

  @Column({ name: 'step_code', type: 'enum', enum: EnablementStepCode })
  stepCode: EnablementStepCode;

  @Column({
    type: 'enum',
    enum: EnablementStepStatus,
    default: EnablementStepStatus.PENDING,
  })
  status: EnablementStepStatus;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'completed_by_id', type: 'int', nullable: true })
  completedById: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
