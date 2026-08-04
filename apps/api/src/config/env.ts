import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS обязателен'),
  COMMIT_SHA: z.string().min(1).default('local-dev'),
  APP_VERSION: z.string().min(1).default('0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ApiEnv = z.infer<typeof envSchema>;

/** Валидирует обязательные переменные окружения API при старте. */
export function loadApiEnv(rawEnv: NodeJS.ProcessEnv = process.env): ApiEnv {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Некорректная конфигурация API: ${details}`);
  }

  return parsed.data;
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
