import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum UserRole {
  SUPER_ADMIN = 'super_admin', // acceso a todas las tiendas (Anthropic-level)
  STORE_ADMIN = 'store_admin', // dueno / admin de su tienda
  CASHIER = 'cashier',         // solo POS de su tienda
}

export const ROLES_KEY = 'roles';

// Decorador para marcar que roles puede acceder a una ruta:
// @Roles(UserRole.STORE_ADMIN, UserRole.CASHIER)
export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no especifica roles, cualquiera autenticado por AuthGuard puede acceder
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = (request.user?.role || request.userRole) as UserRole | undefined;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
