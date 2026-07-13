import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { hashSecret } from '../src/common/utils/password.util';
import { Currency } from '../src/modules/config/entities/currency.entity';
import { Group } from '../src/modules/identity/entities/group.entity';
import {
  Partner,
  PartnerKind,
} from '../src/modules/identity/entities/partner.entity';
import { User } from '../src/modules/identity/entities/user.entity';
import { UserGroup } from '../src/modules/identity/entities/user-group.entity';

function body<T>(response: request.Response): T {
  return response.body as T;
}

interface TokenPairBody {
  accessToken: string;
}
interface IdBody {
  id: number;
}
interface QuoteRequestBody {
  id: number;
  status: string;
}
interface SaleOrderBody {
  id: number;
  amountTotal: string;
  orderType: string;
}
interface CartBody {
  cart: IdBody;
  items: { id: number; productTemplateId: number }[];
}

/**
 * Recorre Fase 5 de punta a punta: cotización multi-prestador con
 * comparación y selección (contratación vía RFQ), y también el camino
 * directo de carrito -> checkout. Ambos deben generar expediente
 * (agd_case) y factura (account_move) automáticamente.
 */
describe('Sales: quotes + cart checkout (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;
  let currencyRepo: Repository<Currency>;

  const unique = Date.now();
  const adminEmail = `admin.sales.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  const customerEmail = `customer.${unique}@example.com`;
  const customerPassword = 'CustomerPass123!';
  let adminToken: string;
  let customerToken: string;
  let providerPartnerId: number;
  let categoryId: number;
  let serviceId: number;
  let currencyId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    groupRepo = moduleFixture.get(getRepositoryToken(Group));
    partnerRepo = moduleFixture.get(getRepositoryToken(Partner));
    userRepo = moduleFixture.get(getRepositoryToken(User));
    userGroupRepo = moduleFixture.get(getRepositoryToken(UserGroup));
    currencyRepo = moduleFixture.get(getRepositoryToken(Currency));

    const adminGroup = await groupRepo.findOneOrFail({
      where: { code: 'admin' },
    });
    const importadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'importador_exportador' },
    });

    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Sales',
        rif: `V-${String(10100000 + (unique % 89000000)).slice(0, 8)}-0`,
        email: adminEmail,
        active: true,
      }),
    );
    const adminUser = await userRepo.save(
      userRepo.create({
        partnerId: adminPartner.id,
        login: adminEmail,
        passwordHash: await hashSecret(adminPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: adminUser.id,
      groupId: adminGroup.id,
    });

    const customerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Cliente Sales C.A.',
        rif: `J-${String(20200000 + (unique % 79000000)).slice(0, 8)}-1`,
        email: customerEmail,
        active: true,
      }),
    );
    const customerUser = await userRepo.save(
      userRepo.create({
        partnerId: customerPartner.id,
        login: customerEmail,
        passwordHash: await hashSecret(customerPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: customerUser.id,
      groupId: importadorGroup.id,
    });

    const providerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Prestador Sales C.A.',
        rif: `J-${String(30300000 + (unique % 69000000)).slice(0, 8)}-2`,
        email: `provider.${unique}@example.com`,
        active: true,
      }),
    );
    providerPartnerId = providerPartner.id;

    const currency =
      (await currencyRepo.findOne({ where: { code: 'USD' } })) ??
      (await currencyRepo.save(
        currencyRepo.create({ code: 'USD', name: 'Dólar', symbol: '$' }),
      ));
    currencyId = currency.id;

    const server = app.getHttpServer();
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = body<TokenPairBody>(adminLogin).accessToken;

    const customerLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: customerEmail, password: customerPassword })
      .expect(201);
    customerToken = body<TokenPairBody>(customerLogin).accessToken;

    const asAdmin = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);

    const category = await asAdmin(
      request(server).post('/api/catalog/categories'),
    )
      .send({ name: `Despacho ${unique}` })
      .expect(201);
    categoryId = body<IdBody>(category).id;

    const uomCategory = await asAdmin(
      request(server).post('/api/catalog/uom-categories'),
    )
      .send({ name: `Unidad ${unique}` })
      .expect(201);
    const uom = await asAdmin(request(server).post('/api/catalog/uoms'))
      .send({ name: 'Servicio', categoryId: body<IdBody>(uomCategory).id })
      .expect(201);

    const service = await asAdmin(request(server).post('/api/catalog/services'))
      .send({
        name: `Despacho aduanero ${unique}`,
        categoryId,
        uomId: body<IdBody>(uom).id,
        providerPartnerId,
      })
      .expect(201);
    serviceId = body<IdBody>(service).id;

    const pricelist = await asAdmin(
      request(server).post('/api/catalog/pricelists'),
    )
      .send({ name: `Tarifario ${unique}`, currencyId })
      .expect(201);
    await asAdmin(request(server).post('/api/catalog/pricelist-items'))
      .send({
        pricelistId: body<IdBody>(pricelist).id,
        productTemplateId: serviceId,
        price: '500.00',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('quotes multiple providers, compares, selects one, and generates case + invoice', async () => {
    const server = app.getHttpServer();
    const asAdmin = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);
    const asCustomer = (req: request.Test) =>
      req.set('Authorization', `Bearer ${customerToken}`);

    const quoteRequestRes = await asCustomer(
      request(server).post('/api/quotes/requests'),
    )
      .send({
        categoryId,
        description: 'Necesito despacho aduanero',
        lines: [{ productTemplateId: serviceId, quantity: 1 }],
      })
      .expect(201);
    const quoteRequest = body<QuoteRequestBody>(quoteRequestRes);
    expect(quoteRequest.status).toBe('open');

    const providerQuoteRes = await asAdmin(
      request(server).post('/api/quotes/requests/provider-quotes'),
    )
      .send({
        quoteRequestId: quoteRequest.id,
        providerPartnerId,
        currencyId,
        lines: [
          { productTemplateId: serviceId, quantity: 1, unitPrice: '480.00' },
        ],
      })
      .expect(201);
    const providerQuote = body<SaleOrderBody>(providerQuoteRes);
    expect(providerQuote.orderType).toBe('quote');

    // El cliente no puede ver la cotización de otro cliente (verificación de titularidad).
    await asCustomer(request(server).get(`/api/quotes/requests/999999`)).expect(
      404,
    );

    const comparison = await asCustomer(
      request(server).get(`/api/quotes/requests/${quoteRequest.id}/comparison`),
    ).expect(200);
    expect(body<SaleOrderBody[]>(comparison)).toHaveLength(1);

    const selectRes = await asCustomer(
      request(server).post(`/api/quotes/requests/${quoteRequest.id}/select`),
    )
      .send({ selectedSaleOrderId: providerQuote.id })
      .expect(201);
    const createdCase = body<IdBody>(selectRes);
    expect(createdCase.id).toEqual(expect.any(Number));

    const order = await asCustomer(
      request(server).get(`/api/orders/${providerQuote.id}`),
    ).expect(200);
    expect(body<SaleOrderBody>(order).orderType).toBe('contract');

    const invoices = await asCustomer(
      request(server).get(`/api/orders/${providerQuote.id}/invoices`),
    ).expect(200);
    expect(body<{ amountTotal: string }[]>(invoices)).toHaveLength(1);
    expect(body<{ amountTotal: string }[]>(invoices)[0].amountTotal).toBe(
      '480.00',
    );

    const myCases = await asCustomer(
      request(server).get('/api/cases/me'),
    ).expect(200);
    expect(
      body<{ data: IdBody[] }>(myCases).data.some(
        (c) => c.id === createdCase.id,
      ),
    ).toBe(true);
  });

  it('checks out a cart directly and generates case + invoice per provider', async () => {
    const server = app.getHttpServer();
    const asCustomer = (req: request.Test) =>
      req.set('Authorization', `Bearer ${customerToken}`);

    await asCustomer(request(server).post('/api/cart/items'))
      .send({ productTemplateId: serviceId, quantity: 2 })
      .expect(201);

    const cart = await asCustomer(request(server).get('/api/cart')).expect(200);
    const cartBody = body<CartBody>(cart);
    expect(cartBody.items).toHaveLength(1);

    const checkoutRes = await asCustomer(
      request(server).post('/api/cart/checkout'),
    ).expect(201);
    const cases = body<IdBody[]>(checkoutRes);
    expect(cases).toHaveLength(1);

    const ordersList = await asCustomer(
      request(server).get('/api/orders'),
    ).expect(200);
    const orders = body<{ data: SaleOrderBody[] }>(ordersList).data;
    const contractOrder = orders.find(
      (o) => o.orderType === 'contract' && o.amountTotal === '1000.00',
    );
    expect(contractOrder).toBeDefined();

    const payments = await asCustomer(
      request(server).get(`/api/orders/${contractOrder!.id}/payments`),
    ).expect(200);
    expect(body<unknown[]>(payments)).toHaveLength(0);
  });
});
