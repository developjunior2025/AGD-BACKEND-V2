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
interface CaseBody {
  id: number;
  code: string;
  status: string;
}
interface ChecklistItemBody {
  id: number;
  fulfilled: boolean;
  documentRequirement: { code: string };
}
interface DocumentBody {
  id: number;
}

/**
 * Recorre Fase 2 de punta a punta: un requisito documental se asocia a un
 * perfil (matriz de gobernanza), se crea un expediente para ese perfil (el
 * checklist se instancia solo), el cierre se bloquea mientras falte el
 * documento obligatorio, y se desbloquea al subirlo y vincularlo.
 */
describe('Cases + governance + documents flow (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;

  const unique = Date.now();
  const adminEmail = `admin.cases.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  let adminToken: string;
  let importadorGroupId: number;

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
    const importadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'importador_exportador' },
    });
    importadorGroupId = importadorGroup.id;

    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Cases',
        rif: `V-${String(30000000 + (unique % 69999999)).slice(0, 8)}-0`,
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

  it('seeds a checklist from the governance matrix and gates case closure on it', async () => {
    const server = app.getHttpServer();
    const auth = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);

    const requirementCode = `RIF-${unique}`;
    const requirementRes = await auth(
      request(server).post('/api/documents/requirements'),
    )
      .send({ code: requirementCode, name: 'Copia de RIF', mandatory: true })
      .expect(201);
    const requirementId = body<{ id: number }>(requirementRes).id;

    await auth(request(server).post('/api/governance/document-profile-matrix'))
      .send({
        groupId: importadorGroupId,
        documentRequirementId: requirementId,
      })
      .expect(201);

    const ownerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Importadora de Prueba C.A.',
        rif: `J-${String(40000000 + (unique % 59999999)).slice(0, 8)}-1`,
        email: `owner.${unique}@example.com`,
        active: true,
      }),
    );

    const createCaseRes = await auth(request(server).post('/api/cases'))
      .send({
        ownerPartnerId: ownerPartner.id,
        profileGroupId: importadorGroupId,
      })
      .expect(201);
    const createdCase = body<CaseBody>(createCaseRes);
    expect(createdCase.status).toBe('open');

    const checklistRes = await auth(
      request(server).get(`/api/cases/${createdCase.id}/checklist`),
    ).expect(200);
    const checklist = body<ChecklistItemBody[]>(checklistRes);
    const requirementItem = checklist.find(
      (item) => item.documentRequirement.code === requirementCode,
    );
    expect(requirementItem).toBeDefined();
    expect(requirementItem?.fulfilled).toBe(false);

    // El cierre debe bloquearse: falta el documento obligatorio.
    await auth(
      request(server).post(`/api/cases/${createdCase.id}/close`),
    ).expect(400);

    const uploadRes = await auth(request(server).post('/api/documents'))
      .field('resModel', 'agd_case')
      .field('resId', String(createdCase.id))
      .attach('file', Buffer.from('contenido de prueba'), 'rif.pdf')
      .expect(201);
    const uploadedDocument = body<DocumentBody>(uploadRes);

    await auth(
      request(server).patch(
        `/api/documents/checklist/${requirementItem!.id}/fulfill`,
      ),
    )
      .send({ documentId: uploadedDocument.id })
      .expect(200);

    // Con el checklist obligatorio cumplido, el cierre ahora procede.
    const closeRes = await auth(
      request(server).post(`/api/cases/${createdCase.id}/close`),
    ).expect(201);
    expect(body<CaseBody>(closeRes).status).toBe('closed');

    const semaphoreRes = await auth(
      request(server).patch(`/api/cases/${createdCase.id}/semaphore`),
    )
      .send({ color: 'yellow', reason: 'Pendiente de retiro' })
      .expect(200);
    expect(body<{ color: string }>(semaphoreRes).color).toBe('yellow');
  });
});
