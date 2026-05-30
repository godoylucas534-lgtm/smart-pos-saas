import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

// Extiende el tipo Request de Express para incluir datos del tenant
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

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const cookieName = process.env.AUTH_COOKIE_NAME || 'pos_at';
    const cookieToken = this.readCookieFromHeader(req.headers.cookie, cookieName);
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (token) {
      try {
        const payload = this.jwtService.verify(token);

        // Inyecta el contexto del tenant en cada request.
        // Los servicios de negocio lo usan para filtrar datos:
        //   this.productRepo.find({ where: { storeId: req.storeId } })
        req.storeId = payload.storeId;
        req.userId = payload.sub;
        req.userRole = payload.role;
      } catch {
        // Token inválido o expirado — el JwtAuthGuard lo manejará
      }
    }

    next();
  }
}
