import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, UserRole } from '@core/guards/roles.guard';
import { SaasService } from './saas.service';

@Controller('saas/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SaasAdminController {
  constructor(private readonly saasService: SaasService) {}

  @Get('tenants')
  listTenants() {
    return this.saasService.listTenants();
  }

  @Patch('tenants/:storeId/suspend')
  suspend(@Param('storeId') storeId: string, @Request() req: any) {
    const actorUserId = req.user?.id ?? req.userId;
    return this.saasService.suspend(storeId, actorUserId, req.ip);
  }

  @Patch('tenants/:storeId/reactivate')
  reactivate(@Param('storeId') storeId: string, @Request() req: any) {
    const actorUserId = req.user?.id ?? req.userId;
    return this.saasService.reactivate(storeId, actorUserId, req.ip);
  }
}
