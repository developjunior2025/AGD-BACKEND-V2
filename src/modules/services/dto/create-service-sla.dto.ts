import { IsInt } from 'class-validator';

export class CreateServiceSlaDto {
  @IsInt()
  productTemplateId: number;

  @IsInt()
  slaRuleId: number;
}
