import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loadWebObservabilityEnv, loadWebPublicEnv } from './env';

describe('loadWebPublicEnv', () => {
  it('принимает валидный API URL', () => {
    const env = loadWebPublicEnv({
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001',
    });

    assert.equal(env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:3001');
  });

  it('падает при пустом значении', () => {
    assert.throws(() => loadWebPublicEnv({ NEXT_PUBLIC_API_BASE_URL: '' }), /обязателен|URL/);
  });
});

describe('loadWebObservabilityEnv', () => {
  it('отключает Faro при неполной конфигурации', () => {
    assert.equal(loadWebObservabilityEnv({}), null);
  });

  it('принимает полную конфигурацию Faro', () => {
    const env = loadWebObservabilityEnv({
      NEXT_PUBLIC_FARO_URL: 'https://example.com/collect/app',
      NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: 'staging',
      NEXT_PUBLIC_COMMIT_SHA: 'abc123',
    });

    assert.equal(env?.NEXT_PUBLIC_COMMIT_SHA, 'abc123');
  });
});
