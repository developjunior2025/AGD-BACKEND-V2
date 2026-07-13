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

function body<T>(response: request.Response): T {
  return response.body as T;
}

interface TokenPairBody {
  accessToken: string;
}
interface IdBody {
  id: number;
}
interface PaginatedBody<T> {
  data: T[];
}

/**
 * Recorre el catálogo público de Fase 3: un servicio recién creado no es
 * visible hasta que se publica una versión de su ficha (agd_service_publication
 * + version), y deja de ser accesible por id público antes de eso. También
 * cubre el flujo de contenido de HOME (aviso publicado) y el lead público.
 */
describe('Public catalog + home (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;

  const unique = Date.now();
  const adminEmail = `admin.catalog.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  let adminToken: string;

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

    const adminGroup = await groupRepo.findOneOrFail({
      where: { code: 'admin' },
    });
    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Catalog',
        rif: `V-${String(50000000 + (unique % 49999999)).slice(0, 8)}-0`,
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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = body<TokenPairBody>(login).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('hides an unpublished service and reveals it once a version is published', async () => {
    const server = app.getHttpServer();
    const auth = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);

    const category = await auth(request(server).post('/api/catalog/categories'))
      .send({ name: `Logística ${unique}` })
      .expect(201);
    const categoryId = body<IdBody>(category).id;

    const uomCategory = await auth(
      request(server).post('/api/catalog/uom-categories'),
    )
      .send({ name: `Unidad ${unique}` })
      .expect(201);
    const uom = await auth(request(server).post('/api/catalog/uoms'))
      .send({ name: 'Servicio', categoryId: body<IdBody>(uomCategory).id })
      .expect(201);
    const uomId = body<IdBody>(uom).id;

    const service = await auth(request(server).post('/api/catalog/services'))
      .send({
        name: `Despacho aduanero ${unique}`,
        categoryId,
        uomId,
      })
      .expect(201);
    const serviceId = body<IdBody>(service).id;

    // Sin publicación, no aparece en el listado público ni por id.
    await request(server).get(`/api/catalog/services/${serviceId}`).expect(404);
    const emptyList = await request(server)
      .get('/api/catalog/services')
      .query({ categoryId })
      .expect(200);
    expect(body<PaginatedBody<IdBody>>(emptyList).data).toHaveLength(0);

    const draftVersion = await auth(
      request(server).post(
        `/api/catalog/services/${serviceId}/publication/versions`,
      ),
    )
      .send({
        content: JSON.stringify({ name: 'Despacho aduanero', sla: '48h' }),
      })
      .expect(201);
    const versionId = body<IdBody>(draftVersion).id;

    // Con versión en borrador, sigue sin ser visible al público.
    await request(server).get(`/api/catalog/services/${serviceId}`).expect(404);

    await auth(
      request(server).post(
        `/api/catalog/services/publication-versions/${versionId}/publish`,
      ),
    ).expect(201);

    const publishedService = await request(server)
      .get(`/api/catalog/services/${serviceId}`)
      .expect(200);
    expect(body<IdBody>(publishedService).id).toBe(serviceId);

    const filledList = await request(server)
      .get('/api/catalog/services')
      .query({ categoryId })
      .expect(200);
    const listedIds = body<PaginatedBody<IdBody>>(filledList).data.map(
      (item) => item.id,
    );
    expect(listedIds).toContain(serviceId);
  });

  it('publishes a home notice and accepts a public lead', async () => {
    const server = app.getHttpServer();
    const auth = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);

    const home = await request(server).get('/api/public/home').expect(200);
    expect(body<{ name: string }>(home).name).toBeTruthy();

    const page = await auth(request(server).post('/api/public/pages'))
      .send({
        slug: `aviso-${unique}`,
        title: 'Aviso operativo',
        body: 'Contenido del aviso',
        pageType: 'notice',
      })
      .expect(201);
    const pageId = body<IdBody>(page).id;

    let notices = await request(server).get('/api/public/notices').expect(200);
    expect(body<{ id: number }[]>(notices).some((n) => n.id === pageId)).toBe(
      false,
    );

    await auth(
      request(server).post(`/api/public/pages/${pageId}/publish`),
    ).expect(201);

    notices = await request(server).get('/api/public/notices').expect(200);
    expect(body<{ id: number }[]>(notices).some((n) => n.id === pageId)).toBe(
      true,
    );

    const lead = await request(server)
      .post('/api/public/leads')
      .send({
        name: 'Visitante interesado',
        email: `lead.${unique}@example.com`,
      })
      .expect(201);
    expect(body<{ status: string }>(lead).status).toBe('new');
  });
});
