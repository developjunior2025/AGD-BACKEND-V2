import { IsInt, IsOptional, IsString } from 'class-validator';

export class SelectQuoteDto {
  @IsInt()
  selectedSaleOrderId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
