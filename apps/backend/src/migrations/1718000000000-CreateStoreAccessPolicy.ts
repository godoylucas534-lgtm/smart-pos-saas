import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateStoreAccessPolicy1718000000000 implements MigrationInterface {
  name = 'CreateStoreAccessPolicy1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'store_access_policy',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'storeId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'accessBlockedUntil',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'autoReactivateAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'customSuspendMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'supportContact',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'store_access_policy',
      new TableIndex({
        name: 'IDX_STORE_ACCESS_POLICY_STORE_ID',
        columnNames: ['storeId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('store_access_policy', 'IDX_STORE_ACCESS_POLICY_STORE_ID');
    await queryRunner.dropTable('store_access_policy');
  }
}