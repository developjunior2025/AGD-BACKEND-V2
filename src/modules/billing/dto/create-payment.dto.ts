import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  accountMoveId: number;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  method?: string;
}
