import { IsInt, IsString } from 'class-validator';

export class StartWorkflowInstanceDto {
  @IsInt()
  governanceWorkflowId: number;

  @IsString()
  resModel: string;

  @IsInt()
  resId: number;
}
