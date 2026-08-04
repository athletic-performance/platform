import type { LiveResponse, ReadyResponse, VersionResponse } from './types';

export type PlatformApiClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export class PlatformApiError extends Error {
  readonly status: number;
  readonly requestId: string | null;

  constructor(message: string, status: number, requestId: string | null) {
    super(message);
    this.name = 'PlatformApiError';
    this.status = status;
    this.requestId = requestId;
  }
}

/** Минимальный HTTP-клиент для технических endpoints API. */
export class PlatformApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PlatformApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getLive(): Promise<LiveResponse> {
    return this.getJson<LiveResponse>('/health/live');
  }

  async getReady(): Promise<ReadyResponse> {
    return this.getJson<ReadyResponse>('/health/ready');
  }

  async getVersion(): Promise<VersionResponse> {
    return this.getJson<VersionResponse>('/version');
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const requestId = response.headers.get('x-request-id');

    if (!response.ok) {
      throw new PlatformApiError(
        `Запрос ${path} завершился со статусом ${response.status}`,
        response.status,
        requestId,
      );
    }

    return (await response.json()) as T;
  }
}
