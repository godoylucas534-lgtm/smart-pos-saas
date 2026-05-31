import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { Store } from '../modules/stores/entities/store.entity';
import { User } from '../modules/users/user.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { Sale, SaleItem } from '../modules/sales/entities/sale.entity';
import { CashRegister } from '../modules/cash-register/entities/cash-register.entity';
import { Expense } from '../modules/expenses/entities/expense.entity';
import { CreditAccount } from '../modules/credit-accounts/entities/credit-account.entity';
import { StockMovement } from '../modules/stock-movements/entities/stock-movement.entity';
import { AuditLog } from '../modules/audit-logs/entities/audit-log.entity';
import { StoreSubscription } from '../modules/saas/entities/store-subscription.entity';
import { StoreAccessPolicy } from '../modules/saas/entities/store-access-policy.entity';
import { StoreCounter } from '../modules/sales/entities/store-counter.entity';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const databaseUrl = process.env.DATABASE_URL;
const sslEnabled = (process.env.DB_SSL || process.env.POSTGRES_SSL || 'false') === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.DB_PORT || process.env.POSTGRES_PORT || 5432),
        username: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'pos_user',
        password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'pos_pass_dev',
        database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'sistema_local',
      }),
  entities: [
    Store,
    User,
    Category,
    Product,
    Customer,
    Sale,
    SaleItem,
    CashRegister,
    Expense,
    CreditAccount,
    StockMovement,
    AuditLog,
StoreSubscription,
    StoreAccessPolicy,
    StoreCounter,
  ],
  migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});
