import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReceiptDiscrepancyType } from '../entities/receipt-discrepancy.entity';

export class CreateReceiptDiscrepancyDto {
  @IsInt()
  stockPickingId: number;

  @IsEnum(ReceiptDiscrepancyType)
  discrepancyType: ReceiptDiscrepancyType;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumberString()
  quantity?: string;
}
