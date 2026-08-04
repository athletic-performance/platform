import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { VersionController } from './version.controller';

describe('VersionController', () => {
  it('возвращает service, version и commitSha', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [VersionController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'APP_VERSION') return '0.0.0';
              if (key === 'COMMIT_SHA') return 'abc123';
              throw new Error(`Неизвестный ключ: ${key}`);
            },
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(VersionController);
    expect(controller.getVersion()).toEqual({
      service: 'api',
      version: '0.0.0',
      commitSha: 'abc123',
    });
  });
});
