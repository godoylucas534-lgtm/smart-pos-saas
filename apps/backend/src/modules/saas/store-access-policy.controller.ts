import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles, UserRole } from '@core/guards/roles.guard';
import { StoreAccessPolicyService } from './store-access-policy.service';
import { UpdateAccessPolicyDto } from './dto/update-access-policy.dto';

@Controller('saas/admin/stores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class StoreAccessPolicyController {
  constructor(private readonly policyService: StoreAccessPolicyService) {}

  @Get(':storeId/policy')
  async getPolicy(@Param('storeId', ParseUUIDPipe) storeId: string) {
    return this.policyService.findByStoreId(storeId);
  }

  @Patch(':storeId/policy')
  async updatePolicy(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: UpdateAccessPolicyDto,
    @Request() req: any,
  ) {
    const actorUserId = req.user?.id ?? req.userId;
    return this.policyService.upsert(storeId, dto, actorUserId, req.ip);
  }
}