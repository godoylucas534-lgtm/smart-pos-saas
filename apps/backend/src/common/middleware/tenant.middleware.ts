import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      storeId?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  private readCookieFromHeader(cookieHeader: string | undefined, key: string): string | null {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [rawName, ...rest] = part.trim().split('=');
      if (rawName === key) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return null;
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET;
    const cookieName = process.env.AUTH_COOKIE_NAME || 'pos_at';
    const cookieToken = this.readCookieFromHeader(req.headers.cookie, cookieName);
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (token && jwtSecret) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: jwtSecret,
        });
        req.storeId = payload.storeId;
        req.userId = payload.sub;
        req.userRole = payload.role;
      } catch (e: any) {
        if (e?.name && e.name !== 'TokenExpiredError') {
          console.warn('JWT verify warning:', e.message);
        }
      }
    }

    next();
  }
}
