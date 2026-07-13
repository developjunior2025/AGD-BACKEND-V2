import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateProductAttributeDto {
  @IsString()
  @MaxLength(64)
  name: string;
}

export class CreateProductAttributeValueDto {
  @IsInt()
  attributeId: number;

  @IsString()
  @MaxLength(64)
  value: string;
}
