import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumberString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProviderQuoteLineInputDto {
  @IsInt()
  productTemplateId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumberString()
  unitPrice: string;
}

export class CreateProviderQuoteDto {
  @IsInt()
  quoteRequestId: number;

  @IsInt()
  providerPartnerId: number;

  @IsInt()
  currencyId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderQuoteLineInputDto)
  lines: ProviderQuoteLineInputDto[];
}
