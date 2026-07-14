import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { hashSecret } from '../src/common/utils/password.util';
import { Group } from '../src/modules/identity/entities/group.entity';
import {
  Partner,
  PartnerKind,
} from '../src/modules/identity/entities/partner.entity';
import { User } from '../src/modules/identity/entities/user.entity';
import { UserGroup } from '../src/modules/identity/entities/user-group.entity';
import { StockLocation } from '../src/modules/warehouse/entities/stock-location.entity';

function body<T>(response: request.Response): T {
  return response.body as T;
}

interface TokenPairBody {
  accessToken: string;
}
interface IdBody {
  id: number;
}
interface PickingBody {
  id: number;
  state: string;
}
interface QuantBody {
  productTemplateId: number;
  locationId: number;
  quantity: string;
}
interface DiscrepancyMatrixBody {
  matrix: { id: number; status: string; totalDiscrepancies: number };
  items: { id: number; resolved: boolean }[];
}

/**
 * Operador del AGD (Fase 7): recepción contra manifiesto SIDUNEA -> saldo de
 * inventario del expediente en el depósito -> pesaje/picking de salida ->
 * consolidación -> matriz de discrepancias SIDUNEA-AGD conciliada.
 */
describe('WMS operator flow (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;
  let locationRepo: Repository<StockLocation>;

  const unique = Date.now();
  const adminEmail = `admin.wms.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  const operatorEmail = `operador.wms.${unique}@example.com`;
  const operatorPassword = 'OperatorPass123!';
  let adminToken: string;
  let operatorToken: string;
  let caseId: number;
  let productTemplateId: number;
  let zoneALocationId: number;
  const manifestNumber = `MANIFEST-${unique}`;

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
    locationRepo = moduleFixture.get(getRepositoryToken(StockLocation));

    const adminGroup = await groupRepo.findOneOrFail({
      where: { code: 'admin' },
    });
    const operadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'operador_agd' },
    });
    const importadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'importador_exportador' },
    });

    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Wms',
        rif: `V-${String(12300000 + (unique % 87000000)).slice(0, 8)}-0`,
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

    const operatorPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Operador',
        lastName: 'AGD',
        rif: `V-${String(45600000 + (unique % 54000000)).slice(0, 8)}-1`,
        email: operatorEmail,
        active: true,
      }),
    );
    const operatorUser = await userRepo.save(
      userRepo.create({
        partnerId: operatorPartner.id,
        login: operatorEmail,
        passwordHash: await hashSecret(operatorPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: operatorUser.id,
      groupId: operadorGroup.id,
    });

    const ownerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Importadora Wms C.A.',
        rif: `J-${String(78900000 + (unique % 21000000)).slice(0, 8)}-2`,
        email: `owner.wms.${unique}@example.com`,
        active: true,
      }),
    );

    const zoneA = await locationRepo.findOneOrFail({
      where: { zoneCode: 'ZONA-A' },
    });
    zoneALocationId = zoneA.id;

    const server = app.getHttpServer();
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = body<TokenPairBody>(adminLogin).accessToken;

    const operatorLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: operatorEmail, password: operatorPassword })
      .expect(201);
    operatorToken = body<TokenPairBody>(operatorLogin).accessToken;

    const createdCase = await request(server)
      .post('/api/cases')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ownerPartnerId: ownerPartner.id,
        profileGroupId: importadorGroup.id,
      })
      .expect(201);
    caseId = body<IdBody>(createdCase).id;

    const category = await request(server)
      .post('/api/catalog/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Carga general ${unique}` })
      .expect(201);
    const uomCategory = await request(server)
      .post('/api/catalog/uom-categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Peso ${unique}` })
      .expect(201);
    const uom = await request(server)
      .post('/api/catalog/uoms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Kilogramo',
        categoryId: body<IdBody>(uomCategory).id,
      })
      .expect(201);
    const product = await request(server)
      .post('/api/catalog/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Maquinaria industrial ${unique}`,
        categoryId: body<IdBody>(category).id,
        uomId: body<IdBody>(uom).id,
      })
      .expect(201);
    productTemplateId = body<IdBody>(product).id;

    await request(server)
      .post('/api/sidunea/modcar-manifest')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ caseId, manifestNumber, carrierName: 'Naviera AGD' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a receipt against a manifest not registered for the case', async () => {
    await request(app.getHttpServer())
      .post('/api/wms/receipts')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({
        caseId,
        manifestNumber: `UNKNOWN-${unique}`,
        lines: [
          {
            productTemplateId,
            quantity: 10,
            destLocationId: zoneALocationId,
          },
        ],
      })
      .expect(404);
  });

  it('runs receipt -> custody/storage -> inventory -> weighing -> picking -> consolidation -> discrepancy reconciliation', async () => {
    const server = app.getHttpServer();
    const asOperator = (req: request.Test) =>
      req.set('Authorization', `Bearer ${operatorToken}`);

    const receiptRes = await asOperator(
      request(server).post('/api/wms/receipts'),
    )
      .send({
        caseId,
        manifestNumber,
        blNumber: `BL-${unique}`,
        lines: [
          {
            productTemplateId,
            quantity: 10,
            destLocationId: zoneALocationId,
            lotName: `LOT-${unique}`,
          },
        ],
      })
      .expect(201);
    const receipt = body<PickingBody>(receiptRes);
    expect(receipt.state).toBe('done');

    const custody = await asOperator(
      request(server).get('/api/wms/custody-records').query({ caseId }),
    ).expect(200);
    expect(body<{ status: string }[]>(custody)).toHaveLength(1);
    expect(body<{ status: string }[]>(custody)[0].status).toBe('active');

    const storagePeriods = await asOperator(
      request(server).get('/api/wms/storage-periods').query({ caseId }),
    ).expect(200);
    expect(body<{ status: string }[]>(storagePeriods)).toHaveLength(1);
    expect(body<{ status: string }[]>(storagePeriods)[0].status).toBe(
      'within_period',
    );

    const inventory = await asOperator(
      request(server).get('/api/wms/inventory').query({ caseId }),
    ).expect(200);
    const quants = body<QuantBody[]>(inventory);
    const zoneAQuant = quants.find((q) => q.locationId === zoneALocationId);
    expect(zoneAQuant?.quantity).toBe('10.00');

    await asOperator(request(server).post('/api/wms/weighing-tickets'))
      .send({ caseId, grossWeight: '1250.50', tareWeight: '250.50' })
      .expect(201);

    // Despacho parcial: intenta sacar más de lo disponible.
    await asOperator(request(server).post('/api/wms/picking-orders'))
      .send({
        caseId,
        lines: [
          {
            productTemplateId,
            quantity: 999,
            sourceLocationId: zoneALocationId,
          },
        ],
      })
      .expect(400);

    const pickingRes = await asOperator(
      request(server).post('/api/wms/picking-orders'),
    )
      .send({
        caseId,
        lines: [
          { productTemplateId, quantity: 4, sourceLocationId: zoneALocationId },
        ],
      })
      .expect(201);
    expect(body<PickingBody>(pickingRes).state).toBe('done');

    const inventoryAfterPicking = await asOperator(
      request(server).get('/api/wms/inventory').query({ caseId }),
    ).expect(200);
    const zoneAQuantAfter = body<QuantBody[]>(inventoryAfterPicking).find(
      (q) => q.locationId === zoneALocationId,
    );
    expect(zoneAQuantAfter?.quantity).toBe('6.00');

    await asOperator(request(server).post('/api/wms/consolidation-orders'))
      .send({ caseId, notes: 'Consolidación de carga parcial' })
      .expect(201);

    await asOperator(request(server).post('/api/wms/receipt-discrepancies'))
      .send({
        stockPickingId: receipt.id,
        discrepancyType: 'shortage',
        description: 'Faltante de 1 unidad respecto al manifiesto',
        quantity: '1.00',
      })
      .expect(201);

    const itemRes = await asOperator(
      request(server).post('/api/wms/discrepancy-matrix/items'),
    )
      .send({
        caseId,
        sidUneaReference: manifestNumber,
        description: 'Diferencia detectada en recepción',
        quantityDifference: '1.00',
      })
      .expect(201);
    const itemId = body<IdBody>(itemRes).id;

    const matrixWithPending = await asOperator(
      request(server).get('/api/wms/discrepancy-matrix').query({ caseId }),
    ).expect(200);
    expect(body<DiscrepancyMatrixBody>(matrixWithPending).matrix.status).toBe(
      'pending',
    );

    // No se puede conciliar con diferencias sin resolver.
    await asOperator(
      request(server).patch('/api/wms/discrepancy-matrix/reconcile').query({
        caseId,
      }),
    ).expect(400);

    await asOperator(
      request(server).patch(
        `/api/wms/discrepancy-matrix/items/${itemId}/resolve`,
      ),
    ).expect(200);

    const reconciled = await asOperator(
      request(server).patch('/api/wms/discrepancy-matrix/reconcile').query({
        caseId,
      }),
    ).expect(200);
    expect(body<{ status: string }>(reconciled).status).toBe('reconciled');
  });
});
