import { MigrationInterface, QueryRunner } from 'typeorm';

export class BootstrapInitialSchema1716000000000 implements MigrationInterface {
  name = 'BootstrapInitialSchema1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'store_admin', 'cashier');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."sales_status_enum" AS ENUM('pending', 'completed', 'cancelled', 'refunded');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."sales_paymentmethod_enum" AS ENUM('cash', 'card', 'transfer', 'credit', 'mixed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."cash_registers_status_enum" AS ENUM('open', 'closed');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."expenses_category_enum" AS ENUM('alquiler', 'servicios', 'insumos', 'otros');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('sale', 'purchase', 'adjustment', 'cancellation');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."store_subscription_plan_enum" AS ENUM('basic', 'pro', 'enterprise');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE "public"."store_subscription_status_enum" AS ENUM('trial', 'active', 'grace_period', 'suspended', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "address" character varying(255),
        "phone" character varying(20),
        "email" character varying(100),
        "taxId" character varying(50),
        "currency" character varying(3) NOT NULL DEFAULT 'PYG',
        "isActive" boolean NOT NULL DEFAULT true,
        "settings" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stores_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_stores_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'cashier',
        "storeId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_users_email_store" ON "users" ("email", "storeId")');

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" character varying(255),
        "color" character varying(7),
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_categories_store_name" ON "categories" ("storeId", "name")');

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "categoryId" uuid,
        "name" character varying(200) NOT NULL,
        "description" character varying(500),
        "sku" character varying(100),
        "barcode" character varying(100),
        "brand" character varying(120),
        "supplier" character varying(120),
        "costPrice" bigint NOT NULL DEFAULT 0,
        "salePrice" bigint NOT NULL,
        "taxRate" double precision NOT NULL DEFAULT 0,
        "stock" numeric(10,3) NOT NULL DEFAULT 0,
        "stockMin" numeric(10,3) NOT NULL DEFAULT 0,
        "unit" character varying(20) NOT NULL DEFAULT 'unidad',
        "isBulk" boolean NOT NULL DEFAULT false,
        "trackStock" boolean NOT NULL DEFAULT true,
        "isActive" boolean NOT NULL DEFAULT true,
        "imageUrl" character varying(500),
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_products_store_sku" ON "products" ("storeId", "sku")');
    await queryRunner.query('CREATE INDEX "IDX_products_store_barcode" ON "products" ("storeId", "barcode")');
    await queryRunner.query('CREATE INDEX "IDX_products_store_active" ON "products" ("storeId", "isActive")');

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100),
        "email" character varying(150),
        "phone" character varying(20),
        "alternativePhone" character varying(20),
        "documentType" character varying(30) DEFAULT 'CI',
        "document" character varying(20),
        "birthDate" date,
        "address" character varying(255),
        "city" character varying(120),
        "businessName" character varying(200),
        "taxDocument" character varying(30),
        "creditLimit" bigint NOT NULL DEFAULT 0,
        "totalPurchases" bigint NOT NULL DEFAULT 0,
        "totalOrders" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customers_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_customers_store_document_unique" ON "customers" ("storeId", "document") WHERE "document" IS NOT NULL');
    await queryRunner.query('CREATE INDEX "IDX_customers_store_phone" ON "customers" ("storeId", "phone")');

    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "customerId" uuid,
        "cashierId" uuid NOT NULL,
        "receiptNumber" character varying(20) NOT NULL,
        "status" "public"."sales_status_enum" NOT NULL DEFAULT 'pending',
        "paymentMethod" "public"."sales_paymentmethod_enum" NOT NULL DEFAULT 'cash',
        "subtotal" bigint NOT NULL DEFAULT 0,
        "taxAmount" bigint NOT NULL DEFAULT 0,
        "discountAmount" bigint NOT NULL DEFAULT 0,
        "total" bigint NOT NULL,
        "amountPaid" bigint NOT NULL DEFAULT 0,
        "changeAmount" bigint NOT NULL DEFAULT 0,
        "notes" text,
        "paymentDetails" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sales_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_customerId" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_sales_cashierId" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_sales_store_createdAt" ON "sales" ("storeId", "createdAt")');
    await queryRunner.query('CREATE INDEX "IDX_sales_store_status" ON "sales" ("storeId", "status")');

    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "saleId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "productName" character varying(200) NOT NULL,
        "productSku" character varying(100),
        "quantity" numeric(10,3) NOT NULL,
        "unitPrice" bigint NOT NULL,
        "taxRate" double precision NOT NULL DEFAULT 0,
        "discountAmount" bigint NOT NULL DEFAULT 0,
        "lineTotal" bigint NOT NULL,
        CONSTRAINT "PK_sale_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_items_saleId" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cash_registers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "cashierId" uuid NOT NULL,
        "status" "public"."cash_registers_status_enum" NOT NULL DEFAULT 'open',
        "openingAmount" bigint NOT NULL DEFAULT 0,
        "closingAmount" bigint,
        "expectedAmount" bigint,
        "difference" bigint,
        "notes" text,
        "closedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash_registers_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cash_registers_cashierId" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "category" "public"."expenses_category_enum" NOT NULL,
        "description" character varying(200) NOT NULL,
        "amount" bigint NOT NULL,
        "date" date NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_expenses_store_date" ON "expenses" ("storeId", "date")');

    await queryRunner.query(`
      CREATE TABLE "credit_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "balance" bigint NOT NULL DEFAULT 0,
        "lastPaymentAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_credit_accounts_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_credit_accounts_store_customer" ON "credit_accounts" ("storeId", "customerId")');

    await queryRunner.query(`
      CREATE TABLE "stock_movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "storeId" uuid NOT NULL,
        "type" "public"."stock_movements_type_enum" NOT NULL,
        "quantity" numeric(10,3) NOT NULL,
        "previousStock" numeric(10,3) NOT NULL,
        "newStock" numeric(10,3) NOT NULL,
        "reference" character varying(150),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_movements_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_stock_movements_store_product_created" ON "stock_movements" ("storeId", "productId", "createdAt")');

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid,
        "userId" uuid,
        "action" character varying(150) NOT NULL,
        "entity" character varying(100),
        "entityId" character varying(150),
        "oldValue" text,
        "newValue" text,
        "ip" character varying(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_audit_logs_store_createdAt" ON "audit_logs" ("storeId", "createdAt")');
    await queryRunner.query('CREATE INDEX "IDX_audit_logs_store_action" ON "audit_logs" ("storeId", "action")');

    await queryRunner.query(`
      CREATE TABLE "store_subscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "storeId" uuid NOT NULL,
        "plan" "public"."store_subscription_plan_enum" NOT NULL DEFAULT 'basic',
        "status" "public"."store_subscription_status_enum" NOT NULL DEFAULT 'trial',
        "trialEndsAt" TIMESTAMPTZ,
        "currentPeriodEndsAt" TIMESTAMPTZ,
        "graceEndsAt" TIMESTAMPTZ,
        "suspendedAt" TIMESTAMPTZ,
        "cancelledAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_subscription_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_store_subscription_storeId" UNIQUE ("storeId"),
        CONSTRAINT "FK_store_subscription_storeId" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_store_subscription_storeId" ON "store_subscription" ("storeId")');

    await queryRunner.query(`
      CREATE TABLE "store_counters" (
        "storeId" uuid NOT NULL,
        "counterName" character varying(100) NOT NULL,
        "currentValue" bigint NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_counters" PRIMARY KEY ("storeId", "counterName")
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_store_counters_store_counter" ON "store_counters" ("storeId", "counterName")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_store_counters_store_counter"');
    await queryRunner.query('DROP TABLE IF EXISTS "store_counters"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_store_subscription_storeId"');
    await queryRunner.query('DROP TABLE IF EXISTS "store_subscription"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_audit_logs_store_action"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_audit_logs_store_createdAt"');
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_stock_movements_store_product_created"');
    await queryRunner.query('DROP TABLE IF EXISTS "stock_movements"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_credit_accounts_store_customer"');
    await queryRunner.query('DROP TABLE IF EXISTS "credit_accounts"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_expenses_store_date"');
    await queryRunner.query('DROP TABLE IF EXISTS "expenses"');

    await queryRunner.query('DROP TABLE IF EXISTS "cash_registers"');
    await queryRunner.query('DROP TABLE IF EXISTS "sale_items"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sales_store_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_sales_store_createdAt"');
    await queryRunner.query('DROP TABLE IF EXISTS "sales"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_customers_store_phone"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_customers_store_document_unique"');
    await queryRunner.query('DROP TABLE IF EXISTS "customers"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_products_store_active"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_products_store_barcode"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_products_store_sku"');
    await queryRunner.query('DROP TABLE IF EXISTS "products"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_categories_store_name"');
    await queryRunner.query('DROP TABLE IF EXISTS "categories"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_email_store"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');

    await queryRunner.query('DROP TABLE IF EXISTS "stores"');

    await queryRunner.query('DROP TYPE IF EXISTS "public"."store_subscription_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."store_subscription_plan_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."stock_movements_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."expenses_category_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."cash_registers_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."sales_paymentmethod_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."sales_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."users_role_enum"');
  }
}
