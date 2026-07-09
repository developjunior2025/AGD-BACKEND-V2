import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { GroupCode } from '../../identity/entities/group.entity';
import { PartnerKind } from '../../identity/entities/partner.entity';

export class RegisterEnablementDto {
  @IsEnum(PartnerKind)
  kind: PartnerKind;

  @ValidateIf(
    (dto: RegisterEnablementDto) => dto.kind === PartnerKind.INDIVIDUAL,
  )
  @IsString()
  @MaxLength(128)
  firstName?: string;

  @ValidateIf(
    (dto: RegisterEnablementDto) => dto.kind === PartnerKind.INDIVIDUAL,
  )
  @IsString()
  @MaxLength(128)
  lastName?: string;

  @ValidateIf((dto: RegisterEnablementDto) => dto.kind === PartnerKind.COMPANY)
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @Matches(/^[VEJPG]-?\d{8}-?\d?$/i, {
    message: 'RIF con formato inválido (ej. J-12345678-9)',
  })
  rif: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsEnum(GroupCode)
  requestedProfile: GroupCode;
}
