import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'La contraseña debe incluir al menos una letra y un número',
  })
  newPassword: string;
}
