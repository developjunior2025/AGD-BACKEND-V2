import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSession } from './entities/auth-session.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    IdentityModule,
    TypeOrmModule.forFeature([AuthSession]),
    PassportModule,
    // Secret y expiresIn se pasan explícitamente en cada signAsync() de
    // AuthService (access vs refresh usan configuración distinta), por lo
    // que el módulo no necesita opciones globales.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
