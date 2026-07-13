import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ContextQueryDto } from '../documents/dto/context-query.dto';
import { CatalogService } from './catalog.service';
import {
  CreateProductAttributeDto,
  CreateProductAttributeValueDto,
} from './dto/create-product-attribute.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { CreateProductProductDto } from './dto/create-product-product.dto';
import { CreateProductTemplateDto } from './dto/create-product-template.dto';
import {
  CreateProductPricelistDto,
  CreateProductPricelistItemDto,
} from './dto/create-pricelist.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import {
  CreateResourceCalendarAttendanceDto,
  CreateResourceCalendarDto,
} from './dto/create-resource-calendar.dto';
import { CreateUomCategoryDto, CreateUomDto } from './dto/create-uom.dto';
import { ListServicesDto } from './dto/list-services.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('categories')
  createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Public()
  @Get('uom-categories')
  listUomCategories() {
    return this.catalogService.listUomCategories();
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('uom-categories')
  createUomCategory(@Body() dto: CreateUomCategoryDto) {
    return this.catalogService.createUomCategory(dto);
  }

  @Public()
  @Get('uoms')
  listUoms() {
    return this.catalogService.listUoms();
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('uoms')
  createUom(@Body() dto: CreateUomDto) {
    return this.catalogService.createUom(dto);
  }

  @Public()
  @Get('attributes')
  listAttributes() {
    return this.catalogService.listAttributes();
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('attributes')
  createAttribute(@Body() dto: CreateProductAttributeDto) {
    return this.catalogService.createAttribute(dto);
  }

  @Public()
  @Get('attributes/:id/values')
  listAttributeValues(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.listAttributeValues(id);
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('attribute-values')
  createAttributeValue(@Body() dto: CreateProductAttributeValueDto) {
    return this.catalogService.createAttributeValue(dto);
  }

  @Public()
  @Get('services')
  listServices(@Query() query: ListServicesDto) {
    return this.catalogService.listServices(query, query.categoryId);
  }

  @Public()
  @Get('services/:id')
  getService(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getService(id);
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('services')
  createService(@Body() dto: CreateProductTemplateDto) {
    return this.catalogService.createService(dto);
  }

  @Public()
  @Get('services/:id/variants')
  listVariants(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.listVariants(id);
  }

  @Public()
  @Get('services/:id/tariff')
  getServiceTariff(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getServiceTariff(id);
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('variants')
  createVariant(@Body() dto: CreateProductProductDto) {
    return this.catalogService.createVariant(dto);
  }

  @RequirePermission(ModelName.CATALOG, 'write')
  @Post('variants/:id/attribute-values/:valueId')
  assignAttributeValue(
    @Param('id', ParseIntPipe) id: number,
    @Param('valueId', ParseIntPipe) valueId: number,
  ) {
    return this.catalogService.assignAttributeValue(id, valueId);
  }

  @Public()
  @Get('pricelists')
  listPricelists() {
    return this.catalogService.listPricelists();
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('pricelists')
  createPricelist(@Body() dto: CreateProductPricelistDto) {
    return this.catalogService.createPricelist(dto);
  }

  @Public()
  @Get('pricelists/:id/items')
  listPricelistItems(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.listPricelistItems(id);
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('pricelist-items')
  createPricelistItem(@Body() dto: CreateProductPricelistItemDto) {
    return this.catalogService.createPricelistItem(dto);
  }

  @Public()
  @Get('ratings')
  listRatings(@Query() query: ContextQueryDto) {
    return this.catalogService.listRatings(query.resModel, query.resId);
  }

  @Public()
  @Post('ratings')
  createRating(@Body() dto: CreateRatingDto) {
    return this.catalogService.createRating(dto);
  }

  @Public()
  @Get('calendars')
  listCalendars(@Query('serviceId') serviceId?: string) {
    return this.catalogService.listCalendars(
      serviceId ? Number(serviceId) : undefined,
    );
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('calendars')
  createCalendar(@Body() dto: CreateResourceCalendarDto) {
    return this.catalogService.createCalendar(dto);
  }

  @Public()
  @Get('calendars/:id/attendances')
  listAttendances(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.listAttendances(id);
  }

  @RequirePermission(ModelName.CATALOG, 'create')
  @Post('attendances')
  createAttendance(@Body() dto: CreateResourceCalendarAttendanceDto) {
    return this.catalogService.createAttendance(dto);
  }
}
