import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class ContextQueryDto {
  @IsString()
  resModel: string;

  @Type(() => Number)
  @IsInt()
  resId: number;
}
