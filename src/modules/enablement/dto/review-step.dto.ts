import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { GroupCode } from '../../identity/entities/group.entity';

export class ReviewStepDto {
  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  notes?: string;

  /** Solo aplica al paso 'asignacion_perfil': permite al revisor ajustar el perfil. */
  @IsOptional()
  @IsEnum(GroupCode)
  groupCode?: GroupCode;
}
