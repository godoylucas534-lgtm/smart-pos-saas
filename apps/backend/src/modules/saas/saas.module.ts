import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSubscription } from './entities/store-subscription.entity';
import { StoreAccessPolicy } from './entities/store-access-policy.entity';
import { SaasService } from './saas.service';
import { SaasController } from './saas.controller';
import { SaasAdminController } from './saas-admin.controller';
import { StoreAccessPolicyService } from './store-access-policy.service';
import { StoreAccessPolicyController } from './store-access-policy.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreSubscription, StoreAccessPolicy]),
    AuditLogsModule,
  ],
  providers: [SaasService, StoreAccessPolicyService],
  controllers: [SaasController, SaasAdminController, StoreAccessPolicyController],
  exports: [SaasService, StoreAccessPolicyService, TypeOrmModule],
})
export class SaasModule {}

