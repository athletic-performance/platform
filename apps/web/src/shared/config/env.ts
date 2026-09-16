import { z } from 'zod';

const optionalPublicUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().url().optional(),
);
const optionalPublicString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL должен быть валидным URL')
    .min(1, 'NEXT_PUBLIC_API_BASE_URL обязателен'),
  NEXT_PUBLIC_FARO_URL: optionalPublicUrl,
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: optionalPublicString,
  NEXT_PUBLIC_COMMIT_SHA: optionalPublicString,
});

export type WebPublicEnv = z.infer<typeof publicEnvSchema>;

/** Валидирует публичные переменные frontend. */
export function loadWebPublicEnv(
  rawEnv: Record<string, string | undefined> = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL,
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
    NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,
  },
): WebPublicEnv {
  const parsed = publicEnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Некорректная конфигурация web: ${details}`);
  }

  return parsed.data;
}

const observabilityEnvSchema = publicEnvSchema.pick({
  NEXT_PUBLIC_FARO_URL: true,
  NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: true,
  NEXT_PUBLIC_COMMIT_SHA: true,
});

export type WebObservabilityEnv = z.infer<typeof observabilityEnvSchema>;

/** Возвращает конфигурацию Faro только когда присутствуют все необходимые значения. */
export function loadWebObservabilityEnv(
  rawEnv: Record<string, string | undefined>,
): WebObservabilityEnv | null {
  const parsed = observabilityEnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    return null;
  }

  const config = parsed.data;
  if (
    !config.NEXT_PUBLIC_FARO_URL ||
    !config.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT ||
    !config.NEXT_PUBLIC_COMMIT_SHA
  ) {
    return null;
  }

  return config;
}
