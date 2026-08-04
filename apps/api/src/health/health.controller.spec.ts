import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('live не зависит от базы данных', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            isDatabaseReady: jest.fn(),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    expect(controller.getLive()).toEqual({ status: 'ok' });
  });

  it('ready возвращает ok при доступной БД', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            isDatabaseReady: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    await expect(controller.getReady()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up' },
    });
  });

  it('ready возвращает ошибку при недоступной БД', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            isDatabaseReady: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(HealthController);
    await expect(controller.getReady()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
