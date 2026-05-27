import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreCounters1716762000000 implements MigrationInterface {
  name = 'CreateStoreCounters1716762000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "store_counters" (
        "storeId" uuid NOT NULL,
        "counterName" varchar(100) NOT NULL,
        "currentValue" bigint NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_counters" PRIMARY KEY ("storeId", "counterName")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_store_counters_store_counter"
      ON "store_counters" ("storeId", "counterName")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_store_counters_store_counter"');
    await queryRunner.query('DROP TABLE IF EXISTS "store_counters"');
  }
}
