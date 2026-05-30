import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSessions1717000000000 implements MigrationInterface {
  name = 'CreateAuthSessions1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auth_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "storeId" uuid NULL,
        "refreshTokenHash" text NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "revokedAt" TIMESTAMP NULL,
        "userAgent" varchar(255) NULL,
        "ip" varchar(64) NULL,
        "metadata" jsonb NULL,
        "lastUsedAt" TIMESTAMP NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_sessions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_auth_sessions_user_revoked" ON "auth_sessions" ("userId", "revokedAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_auth_sessions_store_revoked" ON "auth_sessions" ("storeId", "revokedAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_auth_sessions_expires" ON "auth_sessions" ("expiresAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_sessions_expires"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_sessions_store_revoked"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auth_sessions_user_revoked"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_sessions"`);
  }
}
