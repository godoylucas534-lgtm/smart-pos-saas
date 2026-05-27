import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el storeId del request (inyectado por TenantMiddleware).
 *
 * Uso en controllers:
 *   @Get('products')
 *   findAll(@StoreId() storeId: string) { ... }
 */
export const StoreId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.storeId;
  },
);

/**
 * Extrae el userId del request.
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
  },
);

/**
 * Extrae el rol del usuario.
 */
export const CurrentUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userRole;
  },
);
