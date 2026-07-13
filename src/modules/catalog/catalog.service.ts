import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(UomCategory)
    private readonly uomCategoryRepository: Repository<UomCategory>,
    @InjectRepository(Uom) private readonly uomRepository: Repository<Uom>,
    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductAttributeValue)
    private readonly productAttributeValueRepository: Repository<ProductAttributeValue>,
    @InjectRepository(ProductTemplate)
    private readonly productTemplateRepository: Repository<ProductTemplate>,
    @InjectRepository(ProductProduct)
    private readonly productProductRepository: Repository<ProductProduct>,
    @InjectRepository(ProductProductAttributeValue)
    private readonly productProductAttributeValueRepository: Repository<ProductProductAttributeValue>,
    @InjectRepository(ProductPricelist)
    private readonly productPricelistRepository: Repository<ProductPricelist>,
    @InjectRepository(ProductPricelistItem)
    private readonly productPricelistItemRepository: Repository<ProductPricelistItem>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(ResourceCalendar)
    private readonly resourceCalendarRepository: Repository<ResourceCalendar>,
    @InjectRepository(ResourceCalendarAttendance)
    private readonly resourceCalendarAttendanceRepository: Repository<ResourceCalendarAttendance>,
  ) {}

  // ---- Categorías / unidades de medida -----------------------------------

  listCategories(): Promise<ProductCategory[]> {
    return this.productCategoryRepository.find({ where: { active: true } });
  }

  createCategory(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    return this.productCategoryRepository.save(
      this.productCategoryRepository.create(dto),
    );
  }

  listUomCategories(): Promise<UomCategory[]> {
    return this.uomCategoryRepository.find();
  }

  createUomCategory(dto: CreateUomCategoryDto): Promise<UomCategory> {
    return this.uomCategoryRepository.save(
      this.uomCategoryRepository.create(dto),
    );
  }

  listUoms(): Promise<Uom[]> {
    return this.uomRepository.find({ where: { active: true } });
  }

  createUom(dto: CreateUomDto): Promise<Uom> {
    return this.uomRepository.save(this.uomRepository.create(dto));
  }

  // ---- Atributos ------------------------------------------------------------

  listAttributes(): Promise<ProductAttribute[]> {
    return this.productAttributeRepository.find();
  }

  createAttribute(dto: CreateProductAttributeDto): Promise<ProductAttribute> {
    return this.productAttributeRepository.save(
      this.productAttributeRepository.create(dto),
    );
  }

  listAttributeValues(attributeId: number): Promise<ProductAttributeValue[]> {
    return this.productAttributeValueRepository.find({
      where: { attributeId },
    });
  }

  createAttributeValue(
    dto: CreateProductAttributeValueDto,
  ): Promise<ProductAttributeValue> {
    return this.productAttributeValueRepository.save(
      this.productAttributeValueRepository.create(dto),
    );
  }

  // ---- Servicios (product_template / product_product) -----------------------

  async listServices(
    query: PaginationQueryDto,
    categoryId?: number,
  ): Promise<PaginatedResponseDto<ProductTemplate>> {
    const [data, total] = await this.productTemplateRepository.findAndCount({
      where: { active: true, ...(categoryId ? { categoryId } : {}) },
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.limit,
    });
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  async getService(id: number): Promise<ProductTemplate> {
    const service = await this.productTemplateRepository.findOne({
      where: { id, active: true },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  createService(dto: CreateProductTemplateDto): Promise<ProductTemplate> {
    return this.productTemplateRepository.save(
      this.productTemplateRepository.create(dto),
    );
  }

  listVariants(productTemplateId: number): Promise<ProductProduct[]> {
    return this.productProductRepository.find({
      where: { productTemplateId, active: true },
    });
  }

  createVariant(dto: CreateProductProductDto): Promise<ProductProduct> {
    return this.productProductRepository.save(
      this.productProductRepository.create(dto),
    );
  }

  async assignAttributeValue(
    productProductId: number,
    attributeValueId: number,
  ): Promise<ProductProductAttributeValue> {
    const existing = await this.productProductAttributeValueRepository.findOne({
      where: { productProductId, attributeValueId },
    });
    if (existing) return existing;
    return this.productProductAttributeValueRepository.save(
      this.productProductAttributeValueRepository.create({
        productProductId,
        attributeValueId,
      }),
    );
  }

  // ---- Tarifas (pricelists) ---------------------------------------------------

  listPricelists(): Promise<ProductPricelist[]> {
    return this.productPricelistRepository.find({ where: { active: true } });
  }

  createPricelist(dto: CreateProductPricelistDto): Promise<ProductPricelist> {
    return this.productPricelistRepository.save(
      this.productPricelistRepository.create(dto),
    );
  }

  listPricelistItems(pricelistId: number): Promise<ProductPricelistItem[]> {
    return this.productPricelistItemRepository.find({
      where: { pricelistId, active: true },
    });
  }

  async getServiceTariff(
    productTemplateId: number,
  ): Promise<ProductPricelistItem[]> {
    return this.productPricelistItemRepository.find({
      where: { productTemplateId, active: true },
    });
  }

  createPricelistItem(
    dto: CreateProductPricelistItemDto,
  ): Promise<ProductPricelistItem> {
    return this.productPricelistItemRepository.save(
      this.productPricelistItemRepository.create(dto),
    );
  }

  // ---- Reseñas ------------------------------------------------------------------

  listRatings(resModel: string, resId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { resModel, resId },
      order: { ratedAt: 'DESC' },
    });
  }

  createRating(dto: CreateRatingDto): Promise<Rating> {
    return this.ratingRepository.save(
      this.ratingRepository.create({ ...dto, ratedAt: new Date() }),
    );
  }

  // ---- Disponibilidad (resource calendar) ---------------------------------------

  listCalendars(serviceId?: number): Promise<ResourceCalendar[]> {
    return this.resourceCalendarRepository.find({
      where: { active: true, ...(serviceId ? { serviceId } : {}) },
    });
  }

  createCalendar(dto: CreateResourceCalendarDto): Promise<ResourceCalendar> {
    return this.resourceCalendarRepository.save(
      this.resourceCalendarRepository.create(dto),
    );
  }

  listAttendances(calendarId: number): Promise<ResourceCalendarAttendance[]> {
    return this.resourceCalendarAttendanceRepository.find({
      where: { calendarId },
    });
  }

  createAttendance(
    dto: CreateResourceCalendarAttendanceDto,
  ): Promise<ResourceCalendarAttendance> {
    return this.resourceCalendarAttendanceRepository.save(
      this.resourceCalendarAttendanceRepository.create({
        calendarId: dto.calendarId,
        dayOfWeek: dto.dayOfWeek,
        hourFrom: String(dto.hourFrom),
        hourTo: String(dto.hourTo),
      }),
    );
  }
}
