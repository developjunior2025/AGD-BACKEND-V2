import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { AuthService, RequestMeta } from './auth.service';
import { AllowPasswordChangeRequired } from './decorators/allow-password-change-required.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

function requestMeta(req: Request): RequestMeta {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto.login, dto.password, requestMeta(req));
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, requestMeta(req));
  }

  @AllowPasswordChangeRequired()
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { success: true };
  }

  @Public()
  @Post('password/recover')
  async recoverPassword(@Body() dto: RecoverPasswordDto) {
    await this.authService.recoverPassword(dto.email);
    return {
      message:
        'Si el correo está registrado, recibirá instrucciones para restablecer su contraseña.',
    };
  }

  @Public()
  @Post('password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }

  @AllowPasswordChangeRequired()
  @Post('password/change')
  changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(
      user,
      dto.currentPassword,
      dto.newPassword,
      requestMeta(req),
    );
  }

  @AllowPasswordChangeRequired()
  @Get('sessions')
  listSessions(@CurrentUser() user: RequestUser) {
    return this.authService.listActiveSessions(user.id);
  }

  @AllowPasswordChangeRequired()
  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.authService.revokeSession(user.id, id);
    return { success: true };
  }
}
