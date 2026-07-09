import { IsEnum, IsString } from 'class-validator';
import { PolicyCode } from '../entities/policy-acceptance.entity';

export class AcceptPolicyDto {
  @IsString()
  rif: string;

  @IsEnum(PolicyCode)
  policyCode: PolicyCode;

  @IsString()
  policyVersion: string;
}
