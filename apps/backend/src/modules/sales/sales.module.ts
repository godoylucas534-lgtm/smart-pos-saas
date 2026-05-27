import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, SaleItem } from './entities/sale.entity';
import { StoreCounter } from './entities/store-counter.entity';
import { CreditAccountsModule } from '../credit-accounts/credit-accounts.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, StoreCounter]),
    CreditAccountsModule,
    StockMovementsModule,
    AuditLogsModule,
    CustomersModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
