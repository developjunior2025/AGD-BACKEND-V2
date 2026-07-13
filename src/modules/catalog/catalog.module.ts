import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgdConfigModule } from '../config/config.module';
import { IdentityModule } from '../identity/identity.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductPricelistItem } from './entities/product-pricelist-item.entity';
import { ProductPricelist } from './entities/product-pricelist.entity';
import { ProductProductAttributeValue } from './entities/product-product-attribute-value.entity';
import { ProductProduct } from './entities/product-product.entity';
import { ProductTemplate } from './entities/product-template.entity';
import { Rating } from './entities/rating.entity';
import { ResourceCalendarAttendance } from './entities/resource-calendar-attendance.entity';
import { ResourceCalendar } from './entities/resource-calendar.entity';
import { UomCategory } from './entities/uom-category.entity';
import { Uom } from './entities/uom.entity';

const ENTITIES = [
  ProductCategory,
  UomCategory,
  Uom,
  ProductAttribute,
  ProductAttributeValue,
  ProductTemplate,
  ProductProduct,
  ProductProductAttributeValue,
  ProductPricelist,
  ProductPricelistItem,
  Rating,
  ResourceCalendar,
  ResourceCalendarAttendance,
];

@Module({
  imports: [
    IdentityModule,
    AgdConfigModule,
    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [TypeOrmModule.forFeature(ENTITIES), CatalogService],
})
export class CatalogModule {}
