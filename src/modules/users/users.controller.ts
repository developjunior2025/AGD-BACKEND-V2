import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.id);
  }

  @Get('me/login-history')
  getMyLoginHistory(
    @CurrentUser() user: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.usersService.loginHistory(user.id, query);
  }

  @RequirePermission(ModelName.USER, 'read')
  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.usersService.listUsers(query);
  }

  @RequirePermission(ModelName.USER, 'read')
  @Get(':id/login-history')
  getLoginHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.usersService.loginHistory(id, query);
  }

  @RequirePermission(ModelName.USER, 'write')
  @Post(':id/block')
  async block(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.block(id);
    return { success: true };
  }

  @RequirePermission(ModelName.USER, 'write')
  @Post(':id/unblock')
  async unblock(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.unblock(id);
    return { success: true };
  }
}
