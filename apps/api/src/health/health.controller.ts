import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Liveness: процесс API запущен, без зависимости от PostgreSQL. */
  @Get('live')
  getLive(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** Readiness: API готов обслуживать запросы и PostgreSQL доступен. */
  @Get('ready')
  async getReady(): Promise<{
    status: 'ok';
    checks: { database: 'up' };
  }> {
    const databaseReady = await this.prisma.isDatabaseReady();

    if (!databaseReady) {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: {
          database: 'down',
        },
        message: 'База данных недоступна',
      });
    }

    return {
      status: 'ok',
      checks: {
        database: 'up',
      },
    };
  }
}
