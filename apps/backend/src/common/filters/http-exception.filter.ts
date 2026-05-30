import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const isQueryError = exception instanceof QueryFailedError;
    const status = isHttp
      ? exception.getStatus()
      : isQueryError
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = isHttp ? exception.getResponse() : null;
    let message: string | string[] = 'Internal server error';
    let details: any = undefined;
    let customCode: string | undefined;

    if (typeof payload === 'string') {
      message = payload;
    } else if (payload && typeof payload === 'object') {
      const p = payload as Record<string, any>;
      message = p.message || message;
      details = p.error || p.details;
      customCode = typeof p.code === 'string' ? p.code : undefined;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const queryCode = isQueryError ? (exception as any).driverError?.code : undefined;
    if (isQueryError && queryCode === '23505') {
      message = 'Duplicate value violates a unique constraint.';
    } else if (isQueryError) {
      message = 'Invalid database operation.';
    }

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      console.warn(`[throttle] 429 path=${request.url} ip=${request.ip}`);
      message = 'Demasiados intentos. Espera unos segundos e intenta nuevamente.';
    }

    if (
      status === HttpStatus.UNAUTHORIZED
      && (!message || message === 'Unauthorized' || message === 'Internal server error')
    ) {
      message = 'Credenciales inválidas o sesión expirada.';
    }

    const safeDetails = isProd ? undefined : details;
    const safeMessage = isProd ? (isHttp && status < 500 ? message : 'Internal server error') : message;

    response.status(status).json({
      statusCode: status,
      code: customCode || (isHttp ? 'HTTP_ERROR' : 'UNHANDLED_ERROR'),
      message: safeMessage,
      details: safeDetails,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
