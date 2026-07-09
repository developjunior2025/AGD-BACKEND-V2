import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  login: string;

  @IsString()
  @MinLength(1)
  password: string;
}
