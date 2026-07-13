import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCaseDto {
  @IsInt()
  ownerPartnerId: number;

  @IsInt()
  profileGroupId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
