import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { LogLevel } from '@nestjs/common';

import { CorrelationMiddleware } from './common/correlation/correlation.middleware';
import { RequestLoggingMiddleware } from './common/logging/request-logging.middleware';
import { StructuredLoggerService } from './common/logging/structured-logger.service';
import { loadApiEnv } from './config/env';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { VersionModule } from './version/version.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
      validate: (config) => loadApiEnv(config),
    }),
    PrismaModule,
    HealthModule,
    VersionModule,
  ],
  providers: [
    {
      provide: StructuredLoggerService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.getOrThrow<string>('NODE_ENV');
        const logLevel = config.get<string>('LOG_LEVEL') ?? 'info';
        const nestLevel: LogLevel = logLevel === 'info' ? 'log' : (logLevel as LogLevel);

        return new StructuredLoggerService(nodeEnv, nestLevel);
      },
    },
  ],
  exports: [StructuredLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
