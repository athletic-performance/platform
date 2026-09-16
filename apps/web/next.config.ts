import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const configDir = path.dirname(fileURLToPath(import.meta.url));

// Публичные переменные читаем из корневого .env монорепозитория.
loadDotenv({ path: path.join(configDir, '../../.env') });
loadDotenv({ path: path.join(configDir, '.env') });

const sourceMapUploadVariables = [
  process.env.FARO_SOURCEMAP_API_URL,
  process.env.FARO_APP_ID,
  process.env.FARO_API_KEY,
  process.env.FARO_STACK_ID,
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA,
];
const sourceMapUploadEnabled = sourceMapUploadVariables.every(
  (value) => value !== undefined && value.length > 0,
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    // Vercel предоставляет commit SHA на этапе сборки; локально используется существующий COMMIT_SHA.
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA,
  },
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer && sourceMapUploadEnabled) {
      // Карты не получают публичную ссылку и удаляются Faro CLI после приватной загрузки.
      config.devtool = 'hidden-source-map';
    }

    return config;
  },
};

export default nextConfig;
