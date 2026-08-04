import { PlatformApiError } from '@platform/api-client';

import { createPlatformApiClient } from './platform-api';

export type SystemStatus = {
  web: 'healthy';
  api: 'healthy' | 'unavailable' | 'error';
  database: 'connected' | 'disconnected' | 'unknown';
  version: string | null;
  commitSha: string | null;
  errorMessage: string | null;
  requestId: string | null;
};

/** Собирает состояние контура web → API → PostgreSQL для стартового экрана. */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const client = createPlatformApiClient();

  let api: SystemStatus['api'];
  let database: SystemStatus['database'] = 'unknown';
  let version: string | null = null;
  let commitSha: string | null = null;
  let errorMessage: string | null = null;
  let requestId: string | null = null;

  try {
    const ready = await client.getReady();
    api = 'healthy';
    database = ready.checks.database === 'up' ? 'connected' : 'disconnected';
  } catch (error) {
    if (error instanceof PlatformApiError) {
      requestId = error.requestId;
      errorMessage = error.message;
      // 503 от readiness означает, что процесс API ответил, но БД недоступна.
      if (error.status === 503) {
        api = 'healthy';
        database = 'disconnected';
      } else {
        api = 'unavailable';
      }
    } else {
      api = 'unavailable';
      errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    }
  }

  try {
    const versionResponse = await client.getVersion();
    version = versionResponse.version;
    commitSha = versionResponse.commitSha;
    if (api === 'unavailable') {
      api = 'healthy';
    }
  } catch (error) {
    if (!errorMessage) {
      errorMessage = error instanceof Error ? error.message : 'Не удалось получить /version';
    }

    if (error instanceof PlatformApiError && requestId === null) {
      requestId = error.requestId;
    }
  }

  return {
    web: 'healthy',
    api,
    database,
    version,
    commitSha,
    errorMessage,
    requestId,
  };
}
