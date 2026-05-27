import {
  Controller, Get, Post, Put,
  Body, Param, UseGuards,
  ParseUUIDPipe, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard, Roles, UserRole } from '../../core/guards/roles.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequireSaasFeature, SaasWriteOperation } from '../saas/saas.decorators';
import { SaasFeature } from '../saas/saas.constants';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.STORE_ADMIN)
@SaasWriteOperation()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  findAll(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    return this.usersService.findByStore(storeId);
  }

  @Post()
  @RequireSaasFeature(SaasFeature.MULTI_USER)
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    const saved = await this.usersService.createEmployee(storeId, dto);
    await this.auditLogsService.recordAudit(
      storeId,
      userId,
      'user_creation',
      'User',
      saved.id,
      null,
      saved,
      req.ip,
    );
    return saved;
  }

  @Put(':id')
  @RequireSaasFeature(SaasFeature.MULTI_USER)
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    const oldUser = await this.usersService.findOne(storeId, id);
    const updated = await this.usersService.update(storeId, id, dto);
    await this.auditLogsService.recordAudit(
      storeId,
      userId,
      'user_modification',
      'User',
      updated.id,
      oldUser.toJSON(),
      updated,
      req.ip,
    );
    return updated;
  }
}
