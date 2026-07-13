import { IsInt, IsNumberString, IsString, MaxLength } from 'class-validator';

export class CreateProductPricelistDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsInt()
  currencyId: number;
}

export class CreateProductPricelistItemDto {
  @IsInt()
  pricelistId: number;

  @IsInt()
  productTemplateId: number;

  @IsNumberString()
  price: string;
}
