import { IsIn, IsOptional, IsString } from 'class-validator';

export class DecideWorkflowInstanceDto {
  @IsIn(['approve', 'reject'])
  decision: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  notes?: string;
}
