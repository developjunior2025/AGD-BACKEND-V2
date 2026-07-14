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
interface DeclarationBody {
  id: number;
  status: string;
}

/**
 * Perfil Agente de aduanas (Fase 6): sin licencia activa no puede declarar;
 * sin ser parte del expediente tampoco. Con ambas condiciones, arma la
 * declaración completa (ítems, régimen, liquidación) y la mirroriza a
 * SIDUNEA (DUA con ítems, inspección MODAI, hoja de salida MODSHD).
 */
describe('Customs agent flow (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;
  let currencyRepo: Repository<Currency>;

  const unique = Date.now();
  const adminEmail = `admin.customs.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';
  const agentEmail = `agent.customs.${unique}@example.com`;
  const agentPassword = 'AgentPass123!';
  const otherAgentEmail = `agent.other.${unique}@example.com`;
  const otherAgentPassword = 'OtherAgentPass123!';
  let adminToken: string;
  let agentToken: string;
  let otherAgentToken: string;
  let agentPartnerId: number;
  let caseId: number;
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
    const agentGroup = await groupRepo.findOneOrFail({
      where: { code: 'agente_aduanas' },
    });
    const importadorGroup = await groupRepo.findOneOrFail({
      where: { code: 'importador_exportador' },
    });

    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Customs',
        rif: `V-${String(11100000 + (unique % 88000000)).slice(0, 8)}-0`,
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

    const agentPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Agente',
        lastName: 'Aduanas',
        rif: `V-${String(22200000 + (unique % 77000000)).slice(0, 8)}-1`,
        email: agentEmail,
        active: true,
      }),
    );
    agentPartnerId = agentPartner.id;
    const agentUser = await userRepo.save(
      userRepo.create({
        partnerId: agentPartner.id,
        login: agentEmail,
        passwordHash: await hashSecret(agentPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: agentUser.id,
      groupId: agentGroup.id,
    });

    const otherAgentPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Otro',
        lastName: 'Agente',
        rif: `V-${String(44400000 + (unique % 55000000)).slice(0, 8)}-3`,
        email: otherAgentEmail,
        active: true,
      }),
    );
    const otherAgentUser = await userRepo.save(
      userRepo.create({
        partnerId: otherAgentPartner.id,
        login: otherAgentEmail,
        passwordHash: await hashSecret(otherAgentPassword),
        mustChangePassword: false,
        active: true,
      }),
    );
    await userGroupRepo.insert({
      userId: otherAgentUser.id,
      groupId: agentGroup.id,
    });

    const ownerPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.COMPANY,
        legalName: 'Importadora Customs C.A.',
        rif: `J-${String(33300000 + (unique % 66000000)).slice(0, 8)}-2`,
        email: `owner.customs.${unique}@example.com`,
        active: true,
      }),
    );

    currencyId = (
      (await currencyRepo.findOne({ where: { code: 'USD' } })) ??
      (await currencyRepo.save(
        currencyRepo.create({ code: 'USD', name: 'Dólar', symbol: '$' }),
      ))
    ).id;

    const server = app.getHttpServer();
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    adminToken = body<TokenPairBody>(adminLogin).accessToken;

    const agentLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: agentEmail, password: agentPassword })
      .expect(201);
    agentToken = body<TokenPairBody>(agentLogin).accessToken;

    const otherAgentLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: otherAgentEmail, password: otherAgentPassword })
      .expect(201);
    otherAgentToken = body<TokenPairBody>(otherAgentLogin).accessToken;

    const createdCase = await request(server)
      .post('/api/cases')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ownerPartnerId: ownerPartner.id,
        profileGroupId: importadorGroup.id,
      })
      .expect(201);
    caseId = body<IdBody>(createdCase).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks declaration without an active license or case party role', async () => {
    const server = app.getHttpServer();
    const asAgent = (req: request.Test) =>
      req.set('Authorization', `Bearer ${agentToken}`);

    await asAgent(request(server).post('/api/customs/declarations'))
      .send({ caseId })
      .expect(403);

    await request(server)
      .post(`/api/customs/agents/${agentPartnerId}/license`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ licenseNumber: `LIC-${unique}`, issuedAt: '2026-01-01' })
      .expect(201);

    // Con licencia pero sin ser parte del expediente, sigue bloqueado.
    await asAgent(request(server).post('/api/customs/declarations'))
      .send({ caseId })
      .expect(403);

    await request(server)
      .post(`/api/cases/${caseId}/parties`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ partnerId: agentPartnerId, role: 'agent' })
      .expect(201);
  });

  it('runs the full digital customs file: declaration -> regime -> liquidation -> SIDUNEA mirror', async () => {
    const server = app.getHttpServer();
    const asAgent = (req: request.Test) =>
      req.set('Authorization', `Bearer ${agentToken}`);
    const asAdmin = (req: request.Test) =>
      req.set('Authorization', `Bearer ${adminToken}`);

    const declarationRes = await asAgent(
      request(server).post('/api/customs/declarations'),
    )
      .send({ caseId, description: 'Importación de maquinaria' })
      .expect(201);
    const declaration = body<DeclarationBody>(declarationRes);
    expect(declaration.status).toBe('draft');

    await asAgent(
      request(server).post(`/api/customs/declarations/${declaration.id}/items`),
    )
      .send({
        description: 'Motor industrial',
        tariffCode: '8407.90',
        quantity: '2',
        unitValue: '1000.00',
      })
      .expect(201);

    const regime = await asAdmin(
      request(server).post('/api/sidunea/customs-regimes'),
    )
      .send({ code: `REG-${unique}`, name: 'Importación definitiva' })
      .expect(201);

    await asAgent(
      request(server).post(
        `/api/customs/declarations/${declaration.id}/regime`,
      ),
    )
      .send({ customsRegimeId: body<IdBody>(regime).id })
      .expect(201);

    const liquidation = await asAgent(
      request(server).post(
        `/api/customs/declarations/${declaration.id}/tax-liquidation`,
      ),
    )
      .send({ totalTaxes: '340.00', currencyId })
      .expect(201);
    expect(body<{ totalTaxes: string }>(liquidation).totalTaxes).toBe('340.00');

    const declarationAfter = await asAgent(
      request(server).get(`/api/customs/declarations/${declaration.id}`),
    ).expect(200);
    expect(body<DeclarationBody>(declarationAfter).status).toBe('submitted');

    // Otro agente (sin relación con esta declaración) no puede verla.
    await request(server)
      .get(`/api/customs/declarations/${declaration.id}`)
      .set('Authorization', `Bearer ${otherAgentToken}`)
      .expect(403);

    const duaRes = await asAgent(request(server).post('/api/sidunea/dua'))
      .send({
        caseId,
        duaNumber: `DUA-${unique}`,
        customsDeclarationId: declaration.id,
        items: [
          {
            description: 'Motor industrial',
            tariffCode: '8407.90',
            quantity: 2,
            value: '2000.00',
          },
        ],
      })
      .expect(201);
    const dua = body<IdBody>(duaRes);

    const duaDetail = await asAgent(
      request(server).get(`/api/sidunea/dua/${dua.id}`),
    ).expect(200);
    expect(body<{ items: unknown[] }>(duaDetail).items).toHaveLength(1);

    const inspectionRes = await asAgent(
      request(server).post('/api/sidunea/modai'),
    )
      .send({ caseId, inspectionNumber: `MODAI-${unique}` })
      .expect(201);
    await asAdmin(
      request(server).patch(
        `/api/sidunea/modai/${body<IdBody>(inspectionRes).id}`,
      ),
    )
      .send({ result: 'approved' })
      .expect(200);

    await asAgent(request(server).post('/api/sidunea/modshd-exit-pass'))
      .send({ caseId, exitPassNumber: `MODSHD-${unique}` })
      .expect(201);

    const tracking = await request(server)
      .get(`/api/cases/${caseId}/tracking`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const mirrorTypes = body<{ mirrorRecords: { recordType: string }[] }>(
      tracking,
    ).mirrorRecords.map((r) => r.recordType);
    expect(mirrorTypes).toEqual(
      expect.arrayContaining(['dua', 'inspection', 'exit_pass']),
    );
  });
});
