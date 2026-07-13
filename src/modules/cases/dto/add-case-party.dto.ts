import { IsEnum, IsInt } from 'class-validator';
import { CasePartyRole } from '../entities/case-party.entity';

export class AddCasePartyDto {
  @IsInt()
  partnerId: number;

  @IsEnum(CasePartyRole)
  role: CasePartyRole;
}
