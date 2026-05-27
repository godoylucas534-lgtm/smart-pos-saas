import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { SaasWriteOperation } from '../saas/saas.decorators';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.STORE_ADMIN)
@SaasWriteOperation()
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateExpenseDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.service.create(storeId, dto);
  }

  @Get()
  findAll(@Request() req: any, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.service.findAll(storeId, dateFrom, dateTo);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExpenseDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.service.update(storeId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.service.remove(storeId, id);
  }
}
