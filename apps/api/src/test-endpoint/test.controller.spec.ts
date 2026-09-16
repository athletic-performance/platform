import { ConfigService } from '@nestjs/config';

import { TestController } from './test.controller';

describe('TestController', () => {
  it('throws the staging test error in staging', () => {
    const controller = new TestController({
      get: () => 'staging',
    } as ConfigService);

    expect(() => controller.error()).toThrow(new Error('FND-011 backend staging test'));
  });

  it('returns 404 outside staging through a NotFoundException', () => {
    const controller = new TestController({
      get: () => 'production',
    } as ConfigService);

    expect(() => controller.error()).toThrow('Not Found');
  });
});
