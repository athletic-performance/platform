import { PlatformApiClient } from '@platform/api-client';

import { loadWebPublicEnv } from '../config/env';

export function createPlatformApiClient(): PlatformApiClient {
  const env = loadWebPublicEnv();
  return new PlatformApiClient({ baseUrl: env.NEXT_PUBLIC_API_BASE_URL });
}
