import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    return {
      type: 'postgres',
      host: configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: configService.get<number>('POSTGRES_PORT', 5432),
      username: configService.get<string>('POSTGRES_USER', 'postgres'),
      password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: configService.get<string>('POSTGRES_DB_TEST', configService.get<string>('POSTGRES_DB', 'sistema_local')),
      schema: configService.get<string>('POSTGRES_SCHEMA_TEST', 'e2e_test'),
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true,
      logging: false,
      ssl: false,
    };
  }

  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'postgres'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
    database: configService.get<string>('POSTGRES_DB', 'sistema_local'),
    schema: 'public',
    autoLoadEntities: true,
    synchronize: false,
    logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
    ssl: configService.get<string>('POSTGRES_SSL', 'false') === 'true',
  };
};
