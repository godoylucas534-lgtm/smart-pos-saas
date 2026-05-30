import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import { StockMovement } from '../src/modules/stock-movements/entities/stock-movement.entity';
import { CreditAccount } from '../src/modules/credit-accounts/entities/credit-account.entity';
import { AuditLog } from '../src/modules/audit-logs/entities/audit-log.entity';
import { createTestingApp, resetAndSeed, SeedContext } from './e2e-helpers';

describe('POS Critical E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let baseUrl = '';
  let seed: SeedContext;
  let adminToken = '';
  let cashierToken = '';
  let adminBToken = '';

  const fetchAny: any = (global as any).fetch;
  const jwt = require('jsonwebtoken');
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

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

  async function ensureTestDatabase() {
    const { Client } = require('pg');
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = Number(process.env.POSTGRES_PORT || '5432');
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || 'postgres';
    const testDb = process.env.POSTGRES_DB_TEST || 'sistema_local_test';
    const client = new Client({ host, port, user, password, database: 'postgres' });
    await client.connect();
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDb]);
    if (exists.rowCount === 0) {
      try {
        await client.query(`CREATE DATABASE "${testDb}"`);
      } catch {
        process.env.POSTGRES_DB_TEST = process.env.POSTGRES_DB || 'sistema_local';
      }
    }
    await client.end();
  }

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
    return res.body.accessToken as string;
  };

  const signToken = (user: { id: string; email: string; role: string; storeId: string }) =>
    jwt.sign(
      { sub: user.id, email: user.email, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-secret-key';
    process.env.POSTGRES_DB_TEST = process.env.POSTGRES_DB_TEST || 'sistema_local_test';
    await ensureTestDatabase();
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
    cashierToken = signToken(seed.cashierA);
    adminBToken = signToken(seed.adminB);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Auth + Security smoke', () => {
    it('login admin y cashier OK', async () => {
      const freshAdmin = await login('admin.a@e2e.local', 'Admin1234');
      const freshCashier = await login('cashier.a@e2e.local', 'Cashier1234');
      expect(freshAdmin).toBeTruthy();
      expect(freshCashier).toBeTruthy();
      expect(adminToken).toBeTruthy();
      expect(cashierToken).toBeTruthy();
    });

    it('request sin JWT -> 401', async () => {
      const res = await req('/api/v1/stores/mine');
      expect(res.status).toBe(401);
    });

    it('payload inválido -> 400', async () => {
      const res = await req('/api/v1/credit-accounts/pay', {
        method: 'POST',
        token: adminToken,
        body: { customerId: 'invalid-uuid', amount: 0 },
      });
      expect(res.status).toBe(400);
      expect(String(res.body.message)).toContain('customerId');
    });
  });

  describe('Roles', () => {
    it('cashier no puede anular venta (403), admin sí', async () => {
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

      const denied = await req(`/api/v1/sales/${sale.body.id}/cancel`, {
        method: 'PATCH',
        token: cashierToken,
      });
      expect(denied.status).toBe(403);

      const allowed = await req(`/api/v1/sales/${sale.body.id}/cancel`, {
        method: 'PATCH',
        token: adminToken,
      });
      expect(allowed.status).toBe(200);
    });

    it('cashier no puede pagar crédito (403), admin sí', async () => {
      await openCashRegister(adminToken);
      const sale = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'credit',
          customerId: seed.customerA.id,
          items: [{ productId: seed.productA.id, quantity: 2, unitPrice: 10000 }],
        },
      });
      expect(sale.status).toBe(201);

      const denied = await req('/api/v1/credit-accounts/pay', {
        method: 'POST',
        token: cashierToken,
        body: { customerId: seed.customerA.id, amount: 5000 },
      });
      expect(denied.status).toBe(403);

      const allowed = await req('/api/v1/credit-accounts/pay', {
        method: 'POST',
        token: adminToken,
        body: { customerId: seed.customerA.id, amount: 5000 },
      });
      expect(allowed.status).toBe(201);
    });
  });

  describe('Caja', () => {
    it('apertura, consulta y cierre', async () => {
      const open = await req('/api/v1/cash-register/open', {
        method: 'POST',
        token: cashierToken,
        body: { openingAmount: 100000, notes: 'inicio' },
      });
      expect(open.status).toBe(201);

      const active = await req('/api/v1/cash-register/active', { token: cashierToken });
      expect(active.status).toBe(200);
      expect(active.body).toBeTruthy();
      expect(active.body.status).toBe('open');

      const closed = await req('/api/v1/cash-register/close', {
        method: 'POST',
        token: cashierToken,
        body: { closingAmount: 100000, notes: 'fin' },
      });
      expect(closed.status).toBe(201);
      expect(closed.body.status).toBe('closed');
    });
  });

  describe('Venta', () => {
    it('venta con caja cerrada falla; abrir caja y vender pasa', async () => {
      const blocked = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'cash',
          amountPaid: 12000,
          items: [{ productId: seed.productA.id, quantity: 1, unitPrice: 10000 }],
        },
      });
      expect(blocked.status).toBe(400);
      expect(String(blocked.body?.message || '')).toContain('Debe abrir caja antes de cobrar');

      await openCashRegister(adminToken);
      const allowed = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'cash',
          amountPaid: 12000,
          items: [{ productId: seed.productA.id, quantity: 1, unitPrice: 10000 }],
        },
      });
      expect(allowed.status).toBe(201);
    });

    it('venta normal + decremento stock + kardex', async () => {
      await openCashRegister(adminToken);
      const sale = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'cash',
          amountPaid: 25000,
          items: [{ productId: seed.productA.id, quantity: 2, unitPrice: 10000 }],
        },
      });
      expect(sale.status).toBe(201);

      expect(sale.body.status).toBe('completed');

      const product = await dataSource.getRepository(Product).findOneByOrFail({ id: seed.productA.id });
      expect(Number(product.stock)).toBe(18);

      const movementsRes = await req(`/api/v1/products/${seed.productA.id}/movements`, { token: adminToken });
      expect(movementsRes.status).toBe(200);
      expect(Array.isArray(movementsRes.body)).toBe(true);
      expect(movementsRes.body.length).toBeGreaterThan(0);

      const movement = await dataSource.getRepository(StockMovement).findOne({
        where: { productId: seed.productA.id, storeId: seed.storeA.id },
        order: { createdAt: 'DESC' },
      });
      expect(movement?.type).toBe('sale');
    });
  });

  describe('Crédito', () => {
    it('venta crédito + pago parcial + saldo actualizado', async () => {
      await openCashRegister(adminToken);
      const sale = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'credit',
          customerId: seed.customerA.id,
          items: [{ productId: seed.productA.id, quantity: 3, unitPrice: 10000 }],
        },
      });
      expect(sale.status).toBe(201);

      let account = await dataSource.getRepository(CreditAccount).findOneByOrFail({
        storeId: seed.storeA.id,
        customerId: seed.customerA.id,
      });
      expect(Number(account.balance)).toBe(33000);

      const pay = await req('/api/v1/credit-accounts/pay', {
        method: 'POST',
        token: adminToken,
        body: { customerId: seed.customerA.id, amount: 10000 },
      });
      expect(pay.status).toBe(201);

      account = await dataSource.getRepository(CreditAccount).findOneByOrFail({
        storeId: seed.storeA.id,
        customerId: seed.customerA.id,
      });
      expect(Number(account.balance)).toBe(23000);
    });
  });

  describe('Credito End-to-End', () => {
    it('crea cliente y producto, vende a credito, valida pending y pago parcial', async () => {
      await openCashRegister(adminToken);
      const stamp = Date.now();

      const customerRes = await req('/api/v1/customers', {
        method: 'POST',
        token: adminToken,
        body: {
          firstName: 'Credito',
          lastName: `E2E ${stamp}`,
          document: `CRED-${stamp}`,
          phone: `0991${String(stamp).slice(-6)}`,
        },
      });
      expect(customerRes.status).toBe(201);
      const customerId = customerRes.body?.id as string;
      expect(customerId).toBeTruthy();

      const productRes = await req('/api/v1/products', {
        method: 'POST',
        token: adminToken,
        body: {
          name: `Prod Credito ${stamp}`,
          sku: `PC-${stamp}`,
          costPrice: 5000,
          salePrice: 11000,
          taxRate: 10,
          stock: 30,
          stockMin: 2,
          unit: 'unidad',
          trackStock: true,
        },
      });
      expect(productRes.status).toBe(201);
      const productId = productRes.body?.id as string;
      expect(productId).toBeTruthy();

      const saleRes = await req('/api/v1/sales', {
        method: 'POST',
        token: adminToken,
        body: {
          paymentMethod: 'credit',
          customerId,
          items: [{ productId, quantity: 2, unitPrice: 11000 }],
        },
      });
      expect(saleRes.status).toBe(201);

      const pendingBefore = await req('/api/v1/credit-accounts/pending', { token: adminToken });
      expect(pendingBefore.status).toBe(200);
      const accountBefore = (pendingBefore.body || []).find((a: any) => a.customerId === customerId);
      expect(accountBefore).toBeTruthy();
      expect(Number(accountBefore.balance)).toBeGreaterThan(0);

      const partialAmount = Math.floor(Number(accountBefore.balance) / 2);
      expect(partialAmount).toBeGreaterThan(0);
      const payRes = await req('/api/v1/credit-accounts/pay', {
        method: 'POST',
        token: adminToken,
        body: { customerId, amount: partialAmount },
      });
      expect(payRes.status).toBe(201);

      const pendingAfter = await req('/api/v1/credit-accounts/pending', { token: adminToken });
      expect(pendingAfter.status).toBe(200);
      const accountAfter = (pendingAfter.body || []).find((a: any) => a.customerId === customerId);
      expect(accountAfter).toBeTruthy();
      expect(Number(accountAfter.balance)).toBe(Number(accountBefore.balance) - partialAmount);

      const creditPaymentAudit = await dataSource.getRepository(AuditLog).findOne({
        where: { storeId: seed.storeA.id, action: 'credit_payment', userId: seed.adminA.id },
        order: { createdAt: 'DESC' },
      });
      expect(creditPaymentAudit).toBeTruthy();
      expect(String(creditPaymentAudit?.newValue || '')).toContain(String(partialAmount));
    });
  });

  describe('Multi-tenant', () => {
    it('tienda A no accede tienda B', async () => {
      const res = await req(`/api/v1/stores/${seed.storeB.id}`, { token: adminToken });
      expect(res.status).toBe(403);
    });

    it('tienda A no accede productos de tienda B', async () => {
      const res = await req(`/api/v1/products/${seed.productB.id}`, { token: adminToken });
      expect(res.status).toBe(404);
    });

    it('token de tienda B accede su tienda', async () => {
      const res = await req(`/api/v1/stores/${seed.storeB.id}`, { token: adminBToken });
      expect(res.status).toBe(200);
    });
  });
});
