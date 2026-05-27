import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterStoreDto } from './dto/register-store.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditLogsService: AuditLogsService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Request() req: any) {
    const result = await this.authService.login(req.user);

    try {
      await this.auditLogsService.recordAudit(
        req.user.storeId,
        req.user.id,
        'login',
        'User',
        req.user.id,
        null,
        { email: req.user.email },
        req.ip,
      );
    } catch {
      // No bloquear login por fallas de auditoria
    }

    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const storeId = req.user?.storeId ?? req.storeId;
    const userId = req.user?.id ?? req.userId;
    try {
      await this.auditLogsService.recordAudit(
        storeId,
        userId,
        'logout',
        'User',
        userId,
        null,
        null,
        req.ip,
      );
    } catch {
      // No bloquear logout por fallas de auditoria
    }

    return { ok: true };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async register(@Body() dto: RegisterStoreDto) {
    const result = await this.authService.registerStore(dto);

    if (result.user) {
      try {
        await this.auditLogsService.recordAudit(
          result.user.storeId,
          result.user.id,
          'store_register',
          'Store',
          result.user.storeId,
          null,
          { storeName: dto.storeName, email: dto.email },
        );
      } catch {
        // No bloquear registro por fallas de auditoria
      }
    }

    return result;
  }
}
