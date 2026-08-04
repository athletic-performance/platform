import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { StructuredLoggerService } from './common/logging/structured-logger.service';
import { parseCorsOrigins } from './config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(StructuredLoggerService);
  app.useLogger(logger);

  // Корректное завершение по SIGTERM/SIGINT: закрытие HTTP и Prisma.
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const config = app.get(ConfigService);
  const corsOrigins = parseCorsOrigins(config.getOrThrow<string>('CORS_ORIGINS'));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
  });

  const host = config.getOrThrow<string>('API_HOST');
  const port = config.getOrThrow<number>('API_PORT');
  const environment = config.getOrThrow<string>('NODE_ENV');

  await app.listen(port, host);
  logger.log('api_started', {
    host,
    port,
    environment,
  });
}

void bootstrap();
