import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreSubscription1716720000000 implements MigrationInterface {
  name = 'CreateStoreSubscription1716720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const subscriptionTableExists = await queryRunner.hasTable('store_subscription');
    if (subscriptionTableExists) {
      return;
    }
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."store_subscription_plan_enum" AS ENUM('basic', 'pro', 'enterprise')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."store_subscription_status_enum" AS ENUM('trial', 'active', 'grace_period', 'suspended', 'cancelled')`,
    );
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
    await queryRunner.query(
      `CREATE INDEX "IDX_store_subscription_storeId" ON "store_subscription" ("storeId")`,
    );

    await queryRunner.query(`
      INSERT INTO "store_subscription" ("storeId", "plan", "status", "createdAt", "updatedAt")
      SELECT s."id", 'basic', 'active', now(), now()
      FROM "stores" s
      WHERE NOT EXISTS (
        SELECT 1
        FROM "store_subscription" ss
        WHERE ss."storeId" = s."id"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_store_subscription_storeId"`);
    await queryRunner.query(`ALTER TABLE "store_subscription" DROP CONSTRAINT "FK_store_subscription_storeId"`);
    await queryRunner.query(`DROP TABLE "store_subscription"`);
    await queryRunner.query(`DROP TYPE "public"."store_subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."store_subscription_plan_enum"`);
  }
}
