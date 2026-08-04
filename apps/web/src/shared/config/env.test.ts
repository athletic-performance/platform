import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loadWebPublicEnv } from './env';

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
