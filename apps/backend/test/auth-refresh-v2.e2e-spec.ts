import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestingApp, resetAndSeed, SeedContext } from './e2e-helpers';

const request = require('supertest');

function cookieValue(setCookie: string[] | undefined, name: string): string {
  const list = setCookie || [];
  const raw = list.find((c) => c.startsWith(`${name}=`));
  return raw ? raw.split(';')[0] : '';
}

function csrfFromCookie(cookie: string): string {
  const idx = cookie.indexOf('=');
  return idx >= 0 ? decodeURIComponent(cookie.slice(idx + 1)) : '';
}

const isV2Enabled = () => process.env.AUTH_REFRESH_V2_ENABLED === 'true';
const loginIp = () => `10.10.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;

describe('Auth Refresh V2 E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seed: SeedContext;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-secret-key';
    process.env.AUTH_REFRESH_SECRET = process.env.AUTH_REFRESH_SECRET || 'e2e-refresh-secret';
    if (!isV2Enabled()) return;

    const setup = await createTestingApp();
    app = setup.app;
    dataSource = setup.dataSource;
  });

  beforeEach(async () => {
    if (!isV2Enabled()) return;
    seed = await resetAndSeed(dataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('refresh success rotates refresh token', async () => {
    if (!isV2Enabled()) return;
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    }).set('X-Forwarded-For', loginIp());
    expect(login.status).toBe(200);
    const refreshCookie = cookieValue(login.headers['set-cookie'], 'pos_rt');
    const csrfCookie = cookieValue(login.headers['set-cookie'], 'pos_csrf');
    expect(refreshCookie).toContain('pos_rt=');
    expect(csrfCookie).toContain('pos_csrf=');

    const csrfToken = csrfFromCookie(csrfCookie);
    const refreshed = await agent
      .post('/api/v1/auth/refresh')
      .set('X-CSRF-Token', csrfToken)
      .send({});
    expect(refreshed.status).toBe(200);
    expect(refreshed.body?.user?.email).toBe('admin.a@e2e.local');
    const rotated = cookieValue(refreshed.headers['set-cookie'], 'pos_rt');
    expect(rotated).not.toBe(refreshCookie);
  });

  it('detects refresh token reuse and revokes session', async () => {
    if (!isV2Enabled()) return;
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    }).set('X-Forwarded-For', loginIp());
    const oldRefresh = cookieValue(login.headers['set-cookie'], 'pos_rt');
    const oldCsrf = cookieValue(login.headers['set-cookie'], 'pos_csrf');
    const csrfToken = csrfFromCookie(oldCsrf);

    await agent
      .post('/api/v1/auth/refresh')
      .set('X-CSRF-Token', csrfToken)
      .send({})
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', [oldRefresh, oldCsrf])
      .set('X-CSRF-Token', csrfToken)
      .send({})
      .expect(401);
  });

  it('logout revokes current session and clears auth', async () => {
    if (!isV2Enabled()) return;
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    }).set('X-Forwarded-For', loginIp());
    const csrfCookie = cookieValue(login.headers['set-cookie'], 'pos_csrf');
    const csrfToken = csrfFromCookie(csrfCookie);

    await agent.post('/api/v1/auth/logout').set('X-CSRF-Token', csrfToken).send({}).expect(200);
    await agent.get('/api/v1/auth/me').expect(401);
  });

  it('logout-all invalidates all sessions and refresh fails after', async () => {
    if (!isV2Enabled()) return;
    const agentA = request.agent(app.getHttpServer());
    const agentB = request.agent(app.getHttpServer());

    const loginA = await agentA.post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    }).set('X-Forwarded-For', loginIp());
    const csrfA = csrfFromCookie(cookieValue(loginA.headers['set-cookie'], 'pos_csrf'));

    const loginB = await agentB.post('/api/v1/auth/login').send({
      email: 'admin.a@e2e.local',
      password: 'Admin1234',
    }).set('X-Forwarded-For', loginIp());
    const csrfB = csrfFromCookie(cookieValue(loginB.headers['set-cookie'], 'pos_csrf'));

    await agentA.post('/api/v1/auth/logout-all').set('X-CSRF-Token', csrfA).send({}).expect(200);
    await agentB.post('/api/v1/auth/refresh').set('X-CSRF-Token', csrfB).send({}).expect(401);
  });

  it('revoke session by id invalidates its refresh', async () => {
    if (!isV2Enabled()) return;
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/api/v1/auth/register').send({
      firstName: 'Session',
      lastName: 'Tester',
      email: `session-${Date.now()}@e2e.local`,
      password: 'Admin1234',
      storeName: `Store-${Date.now()}`,
      storeSlug: `store-${Date.now()}`,
      currency: 'PYG',
    });
    expect(login.status).toBe(201);
    const csrfToken = csrfFromCookie(cookieValue(login.headers['set-cookie'], 'pos_csrf'));
    await agent.get('/api/v1/auth/me').expect(200);

    const sessions = await agent.get('/api/v1/auth/sessions').expect(200);
    expect(Array.isArray(sessions.body)).toBe(true);
    const target = sessions.body.find((s: any) => !!s.id);
    expect(target?.id).toBeDefined();

    await agent.delete(`/api/v1/auth/sessions/${target.id}`).set('X-CSRF-Token', csrfToken).expect(204);
    await agent.post('/api/v1/auth/refresh').set('X-CSRF-Token', csrfToken).send({}).expect(401);
  });

  it('V2 mutating endpoints require valid CSRF: missing token returns 403', async () => {
    if (!isV2Enabled()) return;
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/v1/auth/register').send({
      firstName: 'Csrf',
      lastName: 'Check',
      email: `csrf-${Date.now()}@e2e.local`,
      password: 'Admin1234',
      storeName: `Csrf-${Date.now()}`,
      storeSlug: `csrf-${Date.now()}`,
      currency: 'PYG',
    }).expect(201);

    await agent.post('/api/v1/auth/refresh').send({}).expect(403);
    await agent.post('/api/v1/auth/logout-all').send({}).expect(403);
  });
});
