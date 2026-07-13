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
interface CaseBody {
  id: number;
  code: string;
}

/**
 * Perfil Consultor (Fase 4): solo puede resolver un expediente si conoce su
 * referencia SIDUNEA (no puede listar expedientes en general), puede ver
 * seguimiento y documentos de solo lectura, y no puede mutar nada.
 */
describe('Consultor read-only flow (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;

  const unique = Date.now();
  const adminEmail = `admin.consultor.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  const consultorEmail = `consultor.${unique}@example.com`;
  const consultorPassword = 'ConsultorPass123!';
  let adminToken: string;
  let consultorToken: string;
  let caseId: number;
  let duaNumber: string;

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
    const consultorGroup = await groupRepo.findOneOrFail({
      where: { code: 'consultor' },
    });
    const importadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'importador_exportador' },
    });

    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Consultor',
        rif: `V-${String(60000000 + (unique % 39999999)).slice(0, 8)}-0`,
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

    const consultorPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Consultor',
        lastName: 'Test',
        rif: `V-${String(70000000 + (unique % 29999999)).slice(0, 8)}-0`,
        email: consultorEmail,
        active: true,
      }),
    );
    const consultorUser = await userRepo.save(
      userRepo.create({
        partnerId: consultorPartner.id,
        login: consultorEmail,
        passwordHash: await hashSecret(consultorPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: consultorUser.id,
      groupId: consultorGroup.id,
    });

    const server = app.getHttpServer();
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = body<TokenPairBody>(adminLogin).accessToken;

    const consultorLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: consultorEmail, password: consultorPassword })
      .expect(201);
    consultorToken = body<TokenPairBody>(consultorLogin).accessToken;

    const ownerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Exportadora Consultor C.A.',
        rif: `J-${String(80000000 + (unique % 19999999)).slice(0, 8)}-2`,
        email: `owner.consultor.${unique}@example.com`,
        active: true,
      }),
    );

    const createdCase = await request(server)
      .post('/api/cases')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ownerPartnerId: ownerPartner.id,
        profileGroupId: importadorGroup.id,
      })
      .expect(201);
    caseId = body<CaseBody>(createdCase).id;

    duaNumber = `DUA-${unique}`;
    await request(server)
      .post('/api/sidunea/dua')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ caseId, duaNumber })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves a case by SIDUNEA reference but cannot browse or mutate', async () => {
    const server = app.getHttpServer();
    const asConsultor = (req: request.Test) =>
      req.set('Authorization', `Bearer ${consultorToken}`);

    // Sin referencia: el consultor no tiene permiso de listado general.
    await asConsultor(request(server).get('/api/cases')).expect(403);

    // Con la referencia correcta, resuelve el expediente.
    const lookup = await asConsultor(request(server).get('/api/cases/lookup'))
      .query({ dua: duaNumber })
      .expect(200);
    expect(body<IdBody>(lookup).id).toBe(caseId);

    // Referencia inexistente -> 404, no filtra información de otros casos.
    await asConsultor(request(server).get('/api/cases/lookup'))
      .query({ dua: `NOPE-${unique}` })
      .expect(404);

    const tracking = await asConsultor(
      request(server).get(`/api/cases/${caseId}/tracking`),
    ).expect(200);
    expect(body<{ case: IdBody }>(tracking).case.id).toBe(caseId);

    await asConsultor(
      request(server).get(`/api/cases/${caseId}/documents`),
    ).expect(200);

    // Solo lectura: el consultor no puede cerrar el expediente ni tocar el semáforo.
    await asConsultor(
      request(server).post(`/api/cases/${caseId}/close`),
    ).expect(403);
    await asConsultor(request(server).patch(`/api/cases/${caseId}/semaphore`))
      .send({ color: 'red' })
      .expect(403);
  });
});
