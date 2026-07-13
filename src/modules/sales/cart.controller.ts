import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { RequestUser } from '../identity/interfaces/request-user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { SalesService } from './sales.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly salesService: SalesService) {}

  @RequirePermission(ModelName.CART, 'read')
  @Get()
  getCart(@CurrentUser() actor: RequestUser) {
    return this.salesService.getCart(actor.partnerId);
  }

  @RequirePermission(ModelName.CART, 'create')
  @Post('items')
  addItem(@Body() dto: AddCartItemDto, @CurrentUser() actor: RequestUser) {
    return this.salesService.addCartItem(actor.partnerId, dto);
  }

  @RequirePermission(ModelName.CART, 'write')
  @Post('checkout')
  checkout(@CurrentUser() actor: RequestUser) {
    return this.salesService.checkout(actor.partnerId);
  }
}
