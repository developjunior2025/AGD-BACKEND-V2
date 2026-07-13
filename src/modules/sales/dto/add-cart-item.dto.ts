import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  productTemplateId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
