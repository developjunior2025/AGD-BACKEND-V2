import { IsInt, IsNumberString, IsOptional } from 'class-validator';

export class CreateWeighingTicketDto {
  @IsInt()
  caseId: number;

  @IsOptional()
  @IsInt()
  stockPickingId?: number;

  @IsNumberString()
  grossWeight: string;

  @IsOptional()
  @IsNumberString()
  tareWeight?: string;
}
