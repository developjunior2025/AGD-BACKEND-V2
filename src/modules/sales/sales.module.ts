import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from '../billing/billing.module';
import { CasesModule } from '../cases/cases.module';
import { CatalogModule } from '../catalog/catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { CartController } from './cart.controller';
import { OrdersController } from './orders.controller';
import { QuoteComparison } from './entities/quote-comparison.entity';
import { QuoteRequestLine } from './entities/quote-request-line.entity';
import { QuoteRequest } from './entities/quote-request.entity';
import { QuotesController } from './quotes.controller';
import { SalesService } from './sales.service';
import { ServiceCartItem } from './entities/service-cart-item.entity';
import { ServiceCart } from './entities/service-cart.entity';
import { SaleOrderLine } from './entities/sale-order-line.entity';
import { SaleOrder } from './entities/sale-order.entity';

const ENTITIES = [
  SaleOrder,
  SaleOrderLine,
  QuoteRequest,
  QuoteRequestLine,
  QuoteComparison,
  ServiceCart,
  ServiceCartItem,
];

@Module({
  imports: [
    IdentityModule,
    CatalogModule,
    CasesModule,
    BillingModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [QuotesController, CartController, OrdersController],
  providers: [SalesService],
  exports: [TypeOrmModule.forFeature(ENTITIES), SalesService],
})
export class SalesModule {}
