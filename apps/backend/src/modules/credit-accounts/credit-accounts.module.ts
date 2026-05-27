import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditAccount } from './entities/credit-account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreditAccountsService } from './credit-accounts.service';
import { CreditAccountsController } from './credit-accounts.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([CreditAccount, Customer]), AuditLogsModule],
  providers: [CreditAccountsService],
  controllers: [CreditAccountsController],
  exports: [CreditAccountsService],
})
export class CreditAccountsModule {}
