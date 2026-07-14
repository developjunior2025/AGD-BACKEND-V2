import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class PickingLineInputDto {
  @IsInt()
  productTemplateId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  sourceLocationId: number;
}

export class CreatePickingOrderDto {
  @IsInt()
  caseId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickingLineInputDto)
  lines: PickingLineInputDto[];
}
