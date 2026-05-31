import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@core/guards/roles.guard';
import { SaasService } from './saas.service';
import { StoreAccessPolicyService } from './store-access-policy.service';

@Controller('saas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SaasController {
  constructor(
    private readonly saasService: SaasService,
    private readonly storeAccessPolicyService: StoreAccessPolicyService,
  ) {}

  @Get('subscription/mine')
  getMySubscription(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.saasService.getByStoreIdOrFail(storeId);
  }

  @Get('policy/mine')
  getMyPolicy(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.storeAccessPolicyService.findByStoreId(storeId);
  }
}
