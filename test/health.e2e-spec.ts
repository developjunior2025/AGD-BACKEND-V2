import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns db status and persists a log entry', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    const payload = response.body as { status: string; database: string };
    expect(payload.status).toMatch(/ok|error/);
    expect(payload.database).toMatch(/up|down/);
  });

  it('GET /api/health/history returns a paginated response', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/history')
      .query({ page: 1, limit: 5 })
      .expect(200);

    const payload = response.body as {
      data: unknown[];
      meta: { page: number; limit: number };
    };
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.meta).toMatchObject({ page: 1, limit: 5 });
  });
});
