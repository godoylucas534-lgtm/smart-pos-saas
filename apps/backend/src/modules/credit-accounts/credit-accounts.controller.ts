import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreditAccountsService } from './credit-accounts.service';
import { PayCreditDto } from './dto/pay-credit.dto';
import { Roles, RolesGuard, UserRole } from '../../core/guards/roles.guard';
import { RequireSaasFeature, SaasWriteOperation } from '../saas/saas.decorators';
import { SaasFeature } from '../saas/saas.constants';

@Controller('credit-accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@SaasWriteOperation()
@RequireSaasFeature(SaasFeature.CREDITS)
export class CreditAccountsController {
  constructor(private readonly service: CreditAccountsService) {}

  @Get('pending')
  @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
  listPending(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.service.listPending(storeId);
  }

  @Post('pay')
  @Roles(UserRole.STORE_ADMIN)
  pay(@Request() req: any, @Body() dto: PayCreditDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    return this.service.pay(storeId, dto.customerId, dto.amount, userId, req.ip);
  }
}
