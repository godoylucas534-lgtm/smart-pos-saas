import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Store } from '../src/modules/stores/entities/store.entity';
import { User } from '../src/modules/users/user.entity';
import { Category } from '../src/modules/products/entities/category.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Customer } from '../src/modules/customers/entities/customer.entity';
import { UserRole } from '../src/core/guards/roles.guard';
import {
  StoreSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../src/modules/saas/entities/store-subscription.entity';

export type SeedContext = {
  storeA: Store;
  storeB: Store;
  superAdmin: User;
  adminA: User;
  cashierA: User;
  adminB: User;
  productA: Product;
  productB: Product;
  customerA: Customer;
};

export async function createTestingApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  process.env.POSTGRES_SCHEMA_TEST = 'public';
  const { Client } = require('pg');
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = Number(process.env.POSTGRES_PORT || '5432');
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const db = process.env.POSTGRES_DB_TEST || process.env.POSTGRES_DB || 'sistema_local';
  const schema = process.env.POSTGRES_SCHEMA_TEST || 'public';

  const schemaClient = new Client({ host, port, user, password, database: db });
  await schemaClient.connect();
  await schemaClient.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await schemaClient.end();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
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

  await app.init();
  const dataSource = app.get(DataSource);
  return { app, dataSource };
}

export async function resetAndSeed(dataSource: DataSource): Promise<SeedContext> {
  await dataSource.synchronize(true);

  const storeRepo = dataSource.getRepository(Store);
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const customerRepo = dataSource.getRepository(Customer);
  const subscriptionRepo = dataSource.getRepository(StoreSubscription);

  const [storeA, storeB] = await storeRepo.save([
    storeRepo.create({ name: 'Store A', slug: 'store-a', currency: 'PYG', isActive: true }),
    storeRepo.create({ name: 'Store B', slug: 'store-b', currency: 'PYG', isActive: true }),
  ]);

  const [superAdminHash, adminHash, cashierHash, adminBHash] = await Promise.all([
    bcrypt.hash('Super1234', 8),
    bcrypt.hash('Admin1234', 8),
    bcrypt.hash('Cashier1234', 8),
    bcrypt.hash('AdminB1234', 8),
  ]);

  const [superAdmin, adminA, cashierA, adminB] = await userRepo.save([
    userRepo.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super@e2e.local',
      passwordHash: superAdminHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    }),
    userRepo.create({
      firstName: 'Admin',
      lastName: 'A',
      email: 'admin.a@e2e.local',
      passwordHash: adminHash,
      role: UserRole.STORE_ADMIN,
      storeId: storeA.id,
      isActive: true,
    }),
    userRepo.create({
      firstName: 'Cashier',
      lastName: 'A',
      email: 'cashier.a@e2e.local',
      passwordHash: cashierHash,
      role: UserRole.CASHIER,
      storeId: storeA.id,
      isActive: true,
    }),
    userRepo.create({
      firstName: 'Admin',
      lastName: 'B',
      email: 'admin.b@e2e.local',
      passwordHash: adminBHash,
      role: UserRole.STORE_ADMIN,
      storeId: storeB.id,
      isActive: true,
    }),
  ]);

  const [catA, catB] = await categoryRepo.save([
    categoryRepo.create({ name: 'General A', color: '#111111', storeId: storeA.id, isActive: true }),
    categoryRepo.create({ name: 'General B', color: '#222222', storeId: storeB.id, isActive: true }),
  ]);

  const [productA, productB] = await productRepo.save([
    productRepo.create({
      storeId: storeA.id,
      categoryId: catA.id,
      name: 'Producto A',
      sku: 'A-001',
      barcode: '10001',
      costPrice: 5000,
      salePrice: 10000,
      taxRate: 10,
      stock: 20,
      stockMin: 2,
      unit: 'unidad',
      trackStock: true,
      isActive: true,
    }),
    productRepo.create({
      storeId: storeB.id,
      categoryId: catB.id,
      name: 'Producto B',
      sku: 'B-001',
      barcode: '20001',
      costPrice: 7000,
      salePrice: 12000,
      taxRate: 10,
      stock: 15,
      stockMin: 2,
      unit: 'unidad',
      trackStock: true,
      isActive: true,
    }),
  ]);

  const customerA = await customerRepo.save(
    customerRepo.create({
      storeId: storeA.id,
      firstName: 'Cliente',
      lastName: 'A',
      phone: '099100100',
      document: 'DOC-A',
      isActive: true,
    }),
  );

  await subscriptionRepo.save([
    subscriptionRepo.create({
      storeId: storeA.id,
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
    }),
    subscriptionRepo.create({
      storeId: storeB.id,
      plan: SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
    }),
  ]);

  return { storeA, storeB, superAdmin, adminA, cashierA, adminB, productA, productB, customerA };
}
