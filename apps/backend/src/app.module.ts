import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CashRegisterModule } from './modules/cash-register/cash-register.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CreditAccountsModule } from './modules/credit-accounts/credit-accounts.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { HealthController } from './health.controller';
import { SaasModule } from './modules/saas/saas.module';
import { SaasSubscriptionGuard } from './modules/saas/guards/saas-subscription.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? ['.env.production.local', '.env.production', '.env', '../../.env']
          : ['.env.development.local', '.env.development', '.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: process.env.NODE_ENV === 'test' ? 10000 : 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StoresModule,
    ProductsModule,
    SalesModule,
    CustomersModule,
    CashRegisterModule,
    AuditLogsModule,
    CreditAccountsModule,
    ExpensesModule,
    StockMovementsModule,
    SaasModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SaasSubscriptionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('api/v1/auth/(.*)')
      .forRoutes('*');
  }
}

