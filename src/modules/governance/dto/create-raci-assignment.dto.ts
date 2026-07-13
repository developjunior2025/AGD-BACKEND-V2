import { IsEnum, IsInt } from 'class-validator';
import { RaciRole } from '../entities/raci-assignment.entity';

export class CreateRaciAssignmentDto {
  @IsInt()
  processRaciMatrixId: number;

  @IsInt()
  groupId: number;

  @IsEnum(RaciRole)
  role: RaciRole;
}
