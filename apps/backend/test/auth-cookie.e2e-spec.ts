import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { createTestingApp, resetAndSeed } from './e2e-helpers';
import { Store } from '../src/modules/stores/entities/store.entity';
import { User } from '../src/modules/users/user.entity';
import { UserRole } from '../src/core/guards/roles.guard';

const request = require('supertest');

describe('Auth Email Normalization E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-secret-key';
    const setup = await createTestingApp();
    app = setup.app;
    dataSource = setup.dataSource;
  });

  beforeEach(async () => {
    await resetAndSeed(dataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('register con email mixto y login en minúsculas PASS', async () => {
    const stamp = Date.now();
    const mixedEmail = `Mixed.Case.${stamp}@E2E.Local`;
    const normalized = `mixed.case.${stamp}@e2e.local`;

    const register = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      firstName: 'Mixed',
      lastName: 'Case',
      email: mixedEmail,
      password: 'Admin1234',
      storeName: `Store Mixed ${stamp}`,
      storeSlug: `store-mixed-${stamp}`,
      currency: 'PYG',
    });

    expect(register.status).toBe(201);
    expect(register.body?.user?.email).toBe(normalized);

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: normalized,
      password: 'Admin1234',
    });

    expect(login.status).toBe(200);
    expect(login.body?.user?.email).toBe(normalized);
  });

  it('login con espacios laterales en email PASS', async () => {
    const stamp = Date.now();
    const email = `spacey.${stamp}@e2e.local`;

    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      firstName: 'Space',
      lastName: 'Test',
      email,
      password: 'Admin1234',
      storeName: `Store Space ${stamp}`,
      storeSlug: `store-space-${stamp}`,
      currency: 'PYG',
    }).expect(201);

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: `   ${email.toUpperCase()}   `,
      password: 'Admin1234',
    });

    expect(login.status).toBe(200);
    expect(login.body?.user?.email).toBe(email);
  });

  it('register -> logout -> login inmediato PASS', async () => {
    const stamp = Date.now();
    const email = `flow.${stamp}@e2e.local`;

    const register = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      firstName: 'Flow',
      lastName: 'Tester',
      email,
      password: 'Admin1234',
      storeName: `Store Flow ${stamp}`,
      storeSlug: `store-flow-${stamp}`,
      currency: 'PYG',
    });

    expect(register.status).toBe(201);
    const accessToken = register.body?.accessToken as string;
    expect(accessToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(200);

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email,
      password: 'Admin1234',
    });

    expect(login.status).toBe(200);
    expect(login.body?.user?.email).toBe(email);
  });

  it('usuario guardado con mayúsculas permite login en minúsculas', async () => {
    const storeRepo = dataSource.getRepository(Store);
    const userRepo = dataSource.getRepository(User);
    const stamp = Date.now();
    const mixedEmail = `Juan.Test.${stamp}@Mail.com`;
    const normalized = `juan.test.${stamp}@mail.com`;
    const password = 'Admin1234';

    const store = await storeRepo.save(
      storeRepo.create({ name: `Legacy Store ${stamp}`, slug: `legacy-store-${stamp}`, currency: 'PYG', isActive: true }),
    );

    const passwordHash = await bcrypt.hash(password, 12);
    await userRepo.save(
      userRepo.create({
        firstName: 'Juan',
        lastName: 'Test',
        email: mixedEmail,
        passwordHash,
        role: UserRole.STORE_ADMIN,
        storeId: store.id,
        isActive: true,
      }),
    );

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: normalized,
      password,
    });

    expect(login.status).toBe(200);
    expect(String(login.body?.user?.email || '').toLowerCase()).toBe(normalized);
  });

  it('login y luego GET /auth/me devuelve 200 con user correcto', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    });

    expect(login.status).toBe(200);
    const accessToken = login.body?.accessToken as string;
    expect(accessToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body?.user?.email).toBe('admin.a@e2e.local');
    expect(me.body?.user?.storeId).toBeDefined();
  });

  it('login -> refresh -> endpoint protegido PASS', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    });
    expect(login.status).toBe(200);
    const accessToken = login.body?.accessToken as string;
    expect(accessToken).toBeDefined();

    const refresh = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(refresh.status).toBe(200);
    expect(refresh.body?.accessToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${refresh.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body?.user?.email).toBe('admin.a@e2e.local');
  });
});
