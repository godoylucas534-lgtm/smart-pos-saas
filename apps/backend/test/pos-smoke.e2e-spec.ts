import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Store } from '../src/modules/stores/entities/store.entity';
import { User } from '../src/modules/users/user.entity';
import { Category } from '../src/modules/products/entities/category.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Customer } from '../src/modules/customers/entities/customer.entity';
import { CreditAccount } from '../src/modules/credit-accounts/entities/credit-account.entity';
import {
  StoreSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../src/modules/saas/entities/store-subscription.entity';

type JsonBody = Record<string, any> | null;

describe('POS Smoke E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let baseUrl = '';
  const fetchAny: any = (global as any).fetch;

  const creds = {
    adminA: { email: 'adminA@test.local', password: 'admin1234' },
    cashierA: { email: 'cashierA@test.local', password: 'cash12345' },
    adminB: { email: 'adminB@test.local', password: 'adminB123' },
  };

  const ids: Record<string, string> = {};
  let adminAToken = '';
  let cashierAToken = '';
  let adminBToken = '';

  async function ensureTestSchema() {
    const Client = require('pg').Client;
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = Number(process.env.POSTGRES_PORT || '5432');
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || 'postgres';
    const db = process.env.POSTGRES_DB_TEST || process.env.POSTGRES_DB || 'sistema_local';
    const schema = process.env.POSTGRES_SCHEMA_TEST || 'e2e_test';

    const client = new Client({ host, port, user, password, database: db });
    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.end();
  }

  async function req(path: string, options: { method?: string; token?: string; body?: any } = {}) {
    const method = options.method || 'GET';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    const res = await fetchAny(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let json: JsonBody = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: res.status, body: json };
  }

  async function login(email: string, password: string) {
    const res = await req('/api/v1/auth/login', { method: 'POST', body: { email, password } });
    expect(res.status).toBe(200);
    expect(res.body?.accessToken).toBeTruthy();
    return res.body!.accessToken as string;
  }

  async function seedData() {
    const storeRepo = dataSource.getRepository(Store);
    const userRepo = dataSource.getRepository(User);
    const catRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);
    const customerRepo = dataSource.getRepository(Customer);
    const subscriptionRepo = dataSource.getRepository(StoreSubscription);

    const storeA = await storeRepo.save(storeRepo.create({ name: 'Store A', slug: 'store-a', currency: 'PYG' }));
    const storeB = await storeRepo.save(storeRepo.create({ name: 'Store B', slug: 'store-b', currency: 'PYG' }));
    ids.storeA = storeA.id;
    ids.storeB = storeB.id;

    await subscriptionRepo.save(
      subscriptionRepo.create({
        storeId: storeA.id,
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.ACTIVE,
      }),
    );

    await subscriptionRepo.save(
      subscriptionRepo.create({
        storeId: storeB.id,
        plan: SubscriptionPlan.BASIC,
        status: SubscriptionStatus.ACTIVE,
      }),
    );

    const adminHashA = await bcrypt.hash(creds.adminA.password, 12);
    const cashierHashA = await bcrypt.hash(creds.cashierA.password, 12);
    const adminHashB = await bcrypt.hash(creds.adminB.password, 12);

    await userRepo.save(userRepo.create({
      firstName: 'Admin',
      lastName: 'A',
      email: creds.adminA.email,
      passwordHash: adminHashA,
      role: 'store_admin' as any,
      storeId: storeA.id,
      isActive: true,
    }));
    await userRepo.save(userRepo.create({
      firstName: 'Cashier',
      lastName: 'A',
      email: creds.cashierA.email,
      passwordHash: cashierHashA,
      role: 'cashier' as any,
      storeId: storeA.id,
      isActive: true,
    }));
    await userRepo.save(userRepo.create({
      firstName: 'Admin',
      lastName: 'B',
      email: creds.adminB.email,
      passwordHash: adminHashB,
      role: 'store_admin' as any,
      storeId: storeB.id,
      isActive: true,
    }));

    const catA = await catRepo.save(catRepo.create({ storeId: storeA.id, name: 'General', isActive: true }));
    const catB = await catRepo.save(catRepo.create({ storeId: storeB.id, name: 'General', isActive: true }));

    const productA = await productRepo.save(productRepo.create({
      storeId: storeA.id,
      categoryId: catA.id,
      name: 'Prod A1',
      sku: 'A1',
      barcode: '111',
      salePrice: 10000,
      costPrice: 5000,
      taxRate: 10,
      stock: 20,
      stockMin: 2,
      unit: 'unidad',
      isActive: true,
      trackStock: true,
      isBulk: false,
    }));
    const productB = await productRepo.save(productRepo.create({
      storeId: storeB.id,
      categoryId: catB.id,
      name: 'Prod B1',
      sku: 'B1',
      barcode: '222',
      salePrice: 8000,
      costPrice: 3000,
      taxRate: 10,
      stock: 20,
      stockMin: 2,
      unit: 'unidad',
      isActive: true,
      trackStock: true,
      isBulk: false,
    }));
    ids.productA = productA.id;
    ids.productB = productB.id;

    const customerA = await customerRepo.save(customerRepo.create({
      storeId: storeA.id,
      firstName: 'Cliente',
      lastName: 'A',
      documentType: 'CI',
      document: '1234567',
      phone: '0991000000',
      isActive: true,
    }));
    ids.customerA = customerA.id;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e_secret';
    process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
    process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
    process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
    process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
    process.env.POSTGRES_DB_TEST = process.env.POSTGRES_DB_TEST || process.env.POSTGRES_DB || 'sistema_local';
    process.env.POSTGRES_SCHEMA_TEST = process.env.POSTGRES_SCHEMA_TEST || 'e2e_pos_smoke';
    await ensureTestSchema();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('api/v1');

    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;

    dataSource = app.get(DataSource);
    await seedData();
    adminAToken = await login(creds.adminA.email, creds.adminA.password);
    cashierAToken = await login(creds.cashierA.email, creds.cashierA.password);
    adminBToken = await login(creds.adminB.email, creds.adminB.password);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('auth: login store_admin and cashier works', async () => {
    expect(adminAToken).toBeTruthy();
    expect(cashierAToken).toBeTruthy();
  });

  it('security: private endpoint without JWT returns 401 in standard format', async () => {
    const res = await req('/api/v1/products');
    expect(res.status).toBe(401);
    expect(res.body?.statusCode).toBe(401);
    expect(res.body?.code).toBe('HTTP_ERROR');
  });

  it('caja: open -> active -> close', async () => {
    const open = await req('/api/v1/cash-register/open', {
      method: 'POST',
      token: cashierAToken,
      body: { openingAmount: 100000 },
    });
    expect(open.status).toBe(201);

    const active = await req('/api/v1/cash-register/active', { token: cashierAToken });
    expect(active.status).toBe(200);
    expect(active.body?.status).toBe('open');

    const close = await req('/api/v1/cash-register/close', {
      method: 'POST',
      token: cashierAToken,
      body: { closingAmount: 100000 },
    });
    expect(close.status).toBe(201);
    expect(close.body?.status).toBe('closed');
  });

  it('pos: create sale, stock decreases, kardex has movement', async () => {
    const sale = await req('/api/v1/sales', {
      method: 'POST',
      token: adminAToken,
      body: {
        items: [{ productId: ids.productA, quantity: 2, unitPrice: 10000 }],
        discountAmount: 0,
        paymentMethod: 'cash',
        amountPaid: 25000,
      },
    });
    expect(sale.status).toBe(201);
    ids.saleA = sale.body?.id;
    expect(Number(sale.body?.total || 0)).toBeGreaterThan(0);

    const product = await req(`/api/v1/products/${ids.productA}`, { token: adminAToken });
    expect(product.status).toBe(200);
    expect(Number(product.body?.stock)).toBe(18);

    const movements = await req(`/api/v1/products/${ids.productA}/movements`, { token: adminAToken });
    expect(movements.status).toBe(200);
    expect(Array.isArray(movements.body)).toBe(true);
    expect(movements.body?.some((m: any) => m.type === 'sale')).toBe(true);
  });

  it('roles: cashier cannot cancel sale (403) and store_admin can', async () => {
    const cashierCancel = await req(`/api/v1/sales/${ids.saleA}/cancel`, {
      method: 'PATCH',
      token: cashierAToken,
    });
    expect(cashierCancel.status).toBe(403);
    expect(cashierCancel.body?.statusCode).toBe(403);

    const adminCancel = await req(`/api/v1/sales/${ids.saleA}/cancel`, {
      method: 'PATCH',
      token: adminAToken,
    });
    expect(adminCancel.status).toBe(200);
    expect(adminCancel.body?.status).toBe('cancelled');
  });

  it('credito: create credit sale, pending appears, cashier forbidden to pay, admin can pay', async () => {
    const creditSale = await req('/api/v1/sales', {
      method: 'POST',
      token: adminAToken,
      body: {
        customerId: ids.customerA,
        items: [{ productId: ids.productA, quantity: 1, unitPrice: 10000 }],
        paymentMethod: 'credit',
      },
    });
    expect(creditSale.status).toBe(201);

    const pending = await req('/api/v1/credit-accounts/pending', { token: adminAToken });
    expect(pending.status).toBe(200);
    expect(Array.isArray(pending.body)).toBe(true);
    const account = pending.body?.find((a: any) => a.customerId === ids.customerA);
    expect(account).toBeTruthy();
    expect(Number(account.balance)).toBeGreaterThan(0);

    const cashierPay = await req('/api/v1/credit-accounts/pay', {
      method: 'POST',
      token: cashierAToken,
      body: { customerId: ids.customerA, amount: 1000 },
    });
    expect(cashierPay.status).toBe(403);

    const adminPay = await req('/api/v1/credit-accounts/pay', {
      method: 'POST',
      token: adminAToken,
      body: { customerId: ids.customerA, amount: account.balance },
    });
    expect(adminPay.status).toBe(201);
    expect(Number(adminPay.body?.balance)).toBe(0);
  });

  it('multi-tenant: store B cannot access store A customer/sale data', async () => {
    const customerFromB = await req(`/api/v1/customers/${ids.customerA}`, { token: adminBToken });
    expect(customerFromB.status).toBe(404);

    const saleFromB = await req(`/api/v1/sales/${ids.saleA}`, { token: adminBToken });
    expect([404, 400]).toContain(saleFromB.status);
  });

  it('security: invalid payload returns standardized error body', async () => {
    const badPayload = await req('/api/v1/customers', {
      method: 'POST',
      token: adminAToken,
      body: { firstName: 'Bad', email: 'invalid-email' },
    });
    expect(badPayload.status).toBe(400);
    expect(badPayload.body?.statusCode).toBe(400);
    expect(badPayload.body?.code).toBe('HTTP_ERROR');
    expect(badPayload.body?.message).toBeTruthy();
  });

  it('sanity: seeded data does not leak across product lists', async () => {
    const listA = await req('/api/v1/products', { token: adminAToken });
    const listB = await req('/api/v1/products', { token: adminBToken });
    const skusA = (listA.body?.items || []).map((p: any) => p.sku);
    const skusB = (listB.body?.items || []).map((p: any) => p.sku);
    expect(skusA).toContain('A1');
    expect(skusA).not.toContain('B1');
    expect(skusB).toContain('B1');
    expect(skusB).not.toContain('A1');
  });
});
