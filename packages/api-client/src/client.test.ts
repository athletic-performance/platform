import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PlatformApiClient, PlatformApiError } from './client';

describe('PlatformApiClient', () => {
  it('читает успешный JSON-ответ', async () => {
    const client = new PlatformApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: async () =>
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req-1',
          },
        }),
    });

    await assert.doesNotReject(() => client.getLive());
  });

  it('пробрасывает ошибку с request id', async () => {
    const client = new PlatformApiClient({
      baseUrl: 'http://api.test',
      fetchImpl: async () =>
        new Response('fail', {
          status: 503,
          headers: {
            'x-request-id': 'req-err',
          },
        }),
    });

    await assert.rejects(
      () => client.getReady(),
      (error: unknown) => {
        assert.ok(error instanceof PlatformApiError);
        assert.equal(error.status, 503);
        assert.equal(error.requestId, 'req-err');
        return true;
      },
    );
  });
});
