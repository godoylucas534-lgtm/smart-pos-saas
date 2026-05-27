import {
  Controller, Get, Post, Body,
  UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CashRegisterService } from './cash-register.service';
import { Roles, RolesGuard, UserRole } from '../../core/guards/roles.guard';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';

@Controller('cash-register')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CashRegisterController {
  constructor(private cashRegisterService: CashRegisterService) {}

  @Get('active')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  getActive(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    const cashierId = req.user?.id ?? req.userId;
    return this.cashRegisterService.getActive(storeId, cashierId);
  }

  @Post('open')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  open(@Request() req: any, @Body() dto: OpenCashRegisterDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const cashierId = req.user?.id ?? req.userId;
    return this.cashRegisterService.open(
      storeId, cashierId,
      dto.openingAmount, dto.notes
    );
  }

  @Post('close')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  close(@Request() req: any, @Body() dto: CloseCashRegisterDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const cashierId = req.user?.id ?? req.userId;
    return this.cashRegisterService.close(
      storeId, cashierId,
      dto.closingAmount, dto.notes
    );
  }

  @Get('history')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  getHistory(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.cashRegisterService.getHistory(storeId);
  }
}
