import { loadApiEnv, parseCorsOrigins } from './env';

describe('loadApiEnv', () => {
  it('валидирует обязательные переменные', () => {
    const env = loadApiEnv({
      DATABASE_URL: 'postgresql://platform:platform@localhost:5432/platform',
      CORS_ORIGINS: 'http://localhost:3000',
    });

    expect(env.API_PORT).toBe(3001);
    expect(env.COMMIT_SHA).toBe('local-dev');
  });

  it('падает при отсутствии DATABASE_URL', () => {
    expect(() =>
      loadApiEnv({
        CORS_ORIGINS: 'http://localhost:3000',
      }),
    ).toThrow(/DATABASE_URL/);
  });
});

describe('parseCorsOrigins', () => {
  it('разбивает список origins', () => {
    expect(parseCorsOrigins('http://localhost:3000, https://example.com')).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ]);
  });
});
