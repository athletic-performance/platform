import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    // Не блокируем старт процесса: liveness не зависит от PostgreSQL.
    try {
      await this.$connect();
    } catch {
      // Готовность проверяется отдельно в /health/ready.
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Проверка доступности PostgreSQL без раскрытия деталей подключения. */
  async isDatabaseReady(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
