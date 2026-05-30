import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaasWriteOperation } from '../saas/saas.decorators';

@Controller('sales')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@SaasWriteOperation()
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: any, @Body() dto: CreateSaleDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    return this.salesService.create(storeId, userId, dto);
  }

  @Get()
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  findAll(@Request() req: any, @Query() query: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.salesService.findAll(storeId, query);
  }

  @Roles(UserRole.STORE_ADMIN)
  @Get('summary/daily')
  getDailySummary(@Request() req: any, @Query('date') date?: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.salesService.getDailySummary(storeId, date);
  }

  @Roles(UserRole.STORE_ADMIN)
  @Get('stats/hourly')
  getHourly(@Request() req: any, @Query('date') date?: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.salesService.getHourlyStats(storeId, date);
  }

  @Roles(UserRole.STORE_ADMIN)
  @Get('stats/top-products')
  getTopProducts(@Request() req: any, @Query('date') date?: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.salesService.getTopProducts(storeId, date);
  }

  @Get(':id')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.salesService.findOne(storeId, id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.STORE_ADMIN)
  cancel(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    return this.salesService.cancel(storeId, id, userId, req.ip);
  }
}
