import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StoreSubscription, SubscriptionPlan } from '../src/modules/saas/entities/store-subscription.entity';
import { createTestingApp, resetAndSeed, SeedContext } from './e2e-helpers';
import { AuditLog } from '../src/modules/audit-logs/entities/audit-log.entity';

describe('SaaS Subscription E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let baseUrl = '';
  let seed: SeedContext;
  let adminToken = '';
  let superAdminToken = '';
  let adminBToken = '';

  const fetchAny: any = (global as any).fetch;
  const jwt = require('jsonwebtoken');

  const req = async (path: string, options: { method?: string; token?: string; body?: any } = {}) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    const res = await fetchAny(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    return { status: res.status, body };
  };

  const openCashRegister = async (token: string, openingAmount = 100000) => {
    const open = await req('/api/v1/cash-register/open', {
      method: 'POST',
      token,
      body: { openingAmount, notes: 'e2e-open' },
    });
    expect(open.status).toBe(201);
  };

  const login = async (email: string, password: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-auth-transport': 'bearer',
    };
    const resRaw = await fetchAny(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });
    const text = await resRaw.text();
    const res = { status: resRaw.status, body: text ? JSON.parse(text) : null };
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    return res.body.accessToken as string;
  };

  const signToken = (user: { id: string; email: string; role: string; storeId?: string }) =>
    jwt.sign(
      { sub: user.id, email: user.email, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-secret-key';
    const setup = await createTestingApp();
    app = setup.app;
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    dataSource = setup.dataSource;
  });

  beforeEach(async () => {
    seed = await resetAndSeed(dataSource);
    adminToken = signToken(seed.adminA);
    superAdminToken = signToken(seed.superAdmin as any);
    adminBToken = signToken(seed.adminB);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('active store can create sale', async () => {
    await openCashRegister(adminToken);
    const sale = await req('/api/v1/sales', {
      method: 'POST',
      token: adminToken,
      body: {
        paymentMethod: 'cash',
        amountPaid: 12000,
        items: [{ productId: seed.productA.id, quantity: 1, unitPrice: 10000 }],
      },
    });
    expect(sale.status).toBe(201);
  });

  it('suspended store cannot create sale', async () => {
    await openCashRegister(adminToken);
    await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/suspend`, {
      method: 'PATCH',
      token: superAdminToken,
    });

    const sale = await req('/api/v1/sales', {
      method: 'POST',
      token: adminToken,
      body: {
        paymentMethod: 'cash',
        amountPaid: 12000,
        items: [{ productId: seed.productA.id, quantity: 1, unitPrice: 10000 }],
      },
    });
    expect(sale.status).toBe(403);
    expect(String(sale.body.message)).toContain('suspendida');
  });

  it('suspended store can still login', async () => {
    await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/suspend`, {
      method: 'PATCH',
      token: superAdminToken,
    });
    const relogin = await req('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'admin.a@e2e.local', password: 'Admin1234' },
    });
    expect(relogin.status).toBe(200);
    expect(relogin.body.user).toBeTruthy();
  });

  it('suspended store can query /saas/subscription/mine', async () => {
    await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/suspend`, {
      method: 'PATCH',
      token: superAdminToken,
    });
    const sub = await req('/api/v1/saas/subscription/mine', { token: adminToken });
    expect(sub.status).toBe(200);
    expect(sub.body.status).toBe('suspended');
  });

  it('super_admin can suspend and reactivate tenant', async () => {
    const suspended = await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/suspend`, {
      method: 'PATCH',
      token: superAdminToken,
    });
    expect(suspended.status).toBe(200);
    expect(suspended.body.status).toBe('suspended');

    const reactivated = await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/reactivate`, {
      method: 'PATCH',
      token: superAdminToken,
    });
    expect(reactivated.status).toBe(200);
    expect(reactivated.body.status).toBe('active');

    const suspendAudit = await dataSource.getRepository(AuditLog).findOne({
      where: { storeId: seed.storeA.id, action: 'saas_tenant_suspended', userId: seed.superAdmin.id },
      order: { createdAt: 'DESC' },
    });
    expect(suspendAudit).toBeTruthy();

    const reactivateAudit = await dataSource.getRepository(AuditLog).findOne({
      where: { storeId: seed.storeA.id, action: 'saas_tenant_reactivated', userId: seed.superAdmin.id },
      order: { createdAt: 'DESC' },
    });
    expect(reactivateAudit).toBeTruthy();
  });

  it('solo super_admin puede listar tenants y cambiar estado', async () => {
    const asAdminList = await req('/api/v1/saas/admin/tenants', { token: adminToken });
    expect(asAdminList.status).toBe(403);

    const asAdminSuspend = await req(`/api/v1/saas/admin/tenants/${seed.storeA.id}/suspend`, {
      method: 'PATCH',
      token: adminToken,
    });
    expect(asAdminSuspend.status).toBe(403);

    const asSuperList = await req('/api/v1/saas/admin/tenants', { token: superAdminToken });
    expect(asSuperList.status).toBe(200);
    expect(Array.isArray(asSuperList.body)).toBe(true);
    expect(asSuperList.body.some((t: any) => t.storeId === seed.storeA.id)).toBe(true);
  });

  it('basic plan cannot use credits, pro plan can', async () => {
    const basicPending = await req('/api/v1/credit-accounts/pending', { token: adminBToken });
    expect(basicPending.status).toBe(403);
    expect(basicPending.body?.code).toBe('SAAS_FEATURE_NOT_AVAILABLE');
    expect(String(basicPending.body.message)).toContain('credits');

    await openCashRegister(adminToken);
    const proSale = await req('/api/v1/sales', {
      method: 'POST',
      token: adminToken,
      body: {
        paymentMethod: 'credit',
        customerId: seed.customerA.id,
        items: [{ productId: seed.productA.id, quantity: 1, unitPrice: 10000 }],
      },
    });
    expect(proSale.status).toBe(201);

    const proPending = await req('/api/v1/credit-accounts/pending', { token: adminToken });
    expect(proPending.status).toBe(200);

    const subscription = await dataSource.getRepository(StoreSubscription).findOneByOrFail({
      storeId: seed.storeA.id,
    });
    expect(subscription.plan).toBe(SubscriptionPlan.PRO);
  });

  it('tenant basic activo puede ver dashboard base', async () => {
    const daily = await req('/api/v1/sales/summary/daily', { token: adminBToken });
    expect(daily.status).toBe(200);
    expect(daily.body?.totalSales).toBeDefined();

    const topProducts = await req('/api/v1/sales/stats/top-products', { token: adminBToken });
    expect(topProducts.status).toBe(200);
    expect(Array.isArray(topProducts.body)).toBe(true);
  });

  it('rutas premium siguen bloqueadas con codigo consistente', async () => {
    const pending = await req('/api/v1/credit-accounts/pending', { token: adminBToken });
    expect(pending.status).toBe(403);
    expect(pending.body?.code).toBe('SAAS_FEATURE_NOT_AVAILABLE');
    expect(String(pending.body?.message || '')).toContain('credits');
  });
});
