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

/** supertest tipa response.body como `any`; este helper acota el tipo en el punto de lectura. */
function body<T>(response: request.Response): T {
  return response.body as T;
}

interface TokenPairBody {
  accessToken: string;
  refreshToken: string;
}
interface LoginBody extends TokenPairBody {
  user: { mustChangePassword: boolean; groupCodes: string[] };
}
interface EnablementRequestBody {
  id: number;
  status: string;
  currentStep: number;
  userId: number | null;
  steps: Array<{ stepCode: string; status: string; notes: string | null }>;
}

/**
 * Recorre el flujo completo de habilitación de 9 pasos:
 * registro público -> revisión admin (pasos 2-5) -> creación automática de
 * cuenta (paso 6) -> primer login con contraseña temporal -> cambio
 * obligatorio de contraseña (paso 7, derivado) -> aceptación de rol (paso 8)
 * -> activación automática (paso 9) -> login pleno.
 */
describe('Enablement flow (e2e)', () => {
  let app: INestApplication<App>;
  let groupRepo: Repository<Group>;
  let partnerRepo: Repository<Partner>;
  let userRepo: Repository<User>;
  let userGroupRepo: Repository<UserGroup>;

  const unique = Date.now();
  const applicantRif = `J-${String(10000000 + (unique % 89999999)).slice(0, 8)}-1`;
  const applicantEmail = `applicant.${unique}@example.com`;
  const adminEmail = `admin.${unique}@example.com`;
  const adminPassword = 'AdminPass123!';

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

    // Bootstrap de un admin directo a BD (el registro público rechaza el
    // perfil admin a propósito; ver src/database/seeds/create-admin.seed.ts).
    const adminGroup = await groupRepo.findOneOrFail({
      where: { code: 'admin' },
    });
    const adminPartner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'Test',
        rif: `V-${String(20000000 + (unique % 79999999)).slice(0, 8)}-0`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs the full 9-step enablement flow', async () => {
    const server = app.getHttpServer();

    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: adminEmail, password: adminPassword })
      .expect(201);
    const adminToken = body<TokenPairBody>(adminLogin).accessToken;

    const registerResponse = await request(server)
      .post('/api/enablement/requests')
      .send({
        kind: 'individual',
        firstName: 'Juan',
        lastName: 'Pérez',
        rif: applicantRif,
        email: applicantEmail,
        requestedProfile: 'importador_exportador',
      })
      .expect(201);

    const registered = body<EnablementRequestBody>(registerResponse);
    const requestId = registered.id;
    expect(registered.currentStep).toBe(2);
    expect(registered.status).toBe('in_review');

    const ownerView = await request(server)
      .get(`/api/enablement/requests/${requestId}`)
      .query({ rif: applicantRif })
      .expect(200);
    const owned = body<EnablementRequestBody>(ownerView);
    expect(owned.steps).toHaveLength(9);
    expect(owned.steps[0]).toMatchObject({
      stepCode: 'solicitud',
      status: 'done',
    });

    const reviewSteps = [
      'verificacion',
      'validacion_documentos',
      'asignacion_perfil',
      'asignacion_roles',
    ];
    let lastReview: request.Response | undefined;
    for (const step of reviewSteps) {
      lastReview = await request(server)
        .patch(`/api/enablement/requests/${requestId}/steps/${step}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'approve' })
        .expect(200);
    }

    // Tras 'asignacion_roles' se auto-crea la cuenta (paso 6) y avanza a 7.
    const reviewed = body<EnablementRequestBody>(lastReview!);
    expect(reviewed.currentStep).toBe(7);
    expect(reviewed.userId).toEqual(expect.any(Number));

    const adminDetail = await request(server)
      .get(`/api/enablement/requests/${requestId}/admin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const accountStep = body<EnablementRequestBody>(adminDetail).steps.find(
      (s) => s.stepCode === 'creacion_cuenta',
    );
    const tempPasswordMatch = /Contraseña temporal[^:]*:\s*(\S+)/.exec(
      accountStep?.notes ?? '',
    );
    expect(tempPasswordMatch).not.toBeNull();
    const tempPassword = tempPasswordMatch![1];

    // Primer login con contraseña temporal: debe bloquear otras rutas.
    const firstLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: applicantEmail, password: tempPassword })
      .expect(201);
    const firstLoginBody = body<LoginBody>(firstLogin);
    expect(firstLoginBody.user.mustChangePassword).toBe(true);
    const tempToken = firstLoginBody.accessToken;

    await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tempToken}`)
      .expect(403);

    const changePassword = await request(server)
      .post('/api/auth/password/change')
      .set('Authorization', `Bearer ${tempToken}`)
      .send({ currentPassword: tempPassword, newPassword: 'NuevaPass123' })
      .expect(201);
    const freshToken = body<TokenPairBody>(changePassword).accessToken;

    // Paso 7 se sincroniza al consultar la solicitud tras el cambio.
    const afterPasswordChange = await request(server)
      .get(`/api/enablement/requests/${requestId}`)
      .query({ rif: applicantRif })
      .expect(200);
    expect(body<EnablementRequestBody>(afterPasswordChange).currentStep).toBe(
      8,
    );

    const trainingAccept = await request(server)
      .post('/api/enablement/requests/training/accept')
      .set('Authorization', `Bearer ${freshToken}`)
      .expect(201);
    const trained = body<EnablementRequestBody>(trainingAccept);
    expect(trained.status).toBe('active');
    expect(trained.currentStep).toBe(9);

    // Login pleno tras la activación.
    const finalLogin = await request(server)
      .post('/api/auth/login')
      .send({ login: applicantEmail, password: 'NuevaPass123' })
      .expect(201);
    const finalLoginBody = body<LoginBody>(finalLogin);
    expect(finalLoginBody.user.mustChangePassword).toBe(false);
    expect(finalLoginBody.user.groupCodes).toContain('importador_exportador');
  });
});
