import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const configDir = path.dirname(fileURLToPath(import.meta.url));

// Публичные переменные читаем из корневого .env монорепозитория.
loadDotenv({ path: path.join(configDir, '../../.env') });
loadDotenv({ path: path.join(configDir, '.env') });

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
