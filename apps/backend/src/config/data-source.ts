import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Entidades
import { Store } from '../modules/stores/entities/store.entity';
import { User } from '../modules/users/user.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { StoreSubscription } from '../modules/saas/entities/store-subscription.entity';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'pos_user',
  password: process.env.POSTGRES_PASSWORD || 'pos_pass_dev',
  database: process.env.POSTGRES_DB || 'sistema_local',
  entities: [Store, User, Category, Product, Customer, StoreSubscription],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.POSTGRES_SSL === 'true',
});
