import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateServiceCoverageDto {
  @IsInt()
  productTemplateId: number;

  @IsString()
  @MaxLength(128)
  zone: string;
}
