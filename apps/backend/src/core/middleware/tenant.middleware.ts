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

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

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
