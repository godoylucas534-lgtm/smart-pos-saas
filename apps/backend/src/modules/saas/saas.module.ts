import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSubscription } from './entities/store-subscription.entity';
import { SaasService } from './saas.service';
import { SaasController } from './saas.controller';
import { SaasAdminController } from './saas-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSubscription])],
  providers: [SaasService],
  controllers: [SaasController, SaasAdminController],
  exports: [SaasService, TypeOrmModule],
})
export class SaasModule {}

