import { IsInt } from 'class-validator';

export class AssignRegimeDto {
  @IsInt()
  customsRegimeId: number;
}
