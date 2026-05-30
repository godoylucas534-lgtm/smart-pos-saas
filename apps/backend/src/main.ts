import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { isAllowedCorsOrigin, parseCorsOrigins } from './config/cors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';
  const frontendUrls = parseCorsOrigins(
    process.env.CORS_ORIGIN || process.env.FRONTEND_URLS || process.env.FRONTEND_URL,
  );
  const enableVercelPreviewCors = process.env.ENABLE_VERCEL_PREVIEW_CORS === 'true';

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = isAllowedCorsOrigin(origin, frontendUrls, {
        isProd,
        enableVercelPreviewCors,
      });
      if (allowed) return callback(null, true);

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Transport', 'X-CSRF-Token'],
  });

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend corriendo en puerto ${port} - /api/v1`);
}

bootstrap();
