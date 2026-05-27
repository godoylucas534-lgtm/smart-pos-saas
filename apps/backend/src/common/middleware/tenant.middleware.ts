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

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET;

    if (authHeader && authHeader.startsWith('Bearer ') && jwtSecret) {
      const token = authHeader.slice(7);
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
