import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL должен быть валидным URL')
    .min(1, 'NEXT_PUBLIC_API_BASE_URL обязателен'),
});

export type WebPublicEnv = z.infer<typeof publicEnvSchema>;

/** Валидирует публичные переменные frontend. */
export function loadWebPublicEnv(
  rawEnv: Record<string, string | undefined> = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
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
