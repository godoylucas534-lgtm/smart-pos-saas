import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), AuditLogsModule, StockMovementsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
