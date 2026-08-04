/** Ответ готовности API и базы данных. */
export type ReadyResponse = {
  status: 'ok' | 'error';
  checks: {
    database: 'up' | 'down';
  };
};

/** Ответ версии сервиса. */
export type VersionResponse = {
  service: string;
  version: string;
  commitSha: string;
};

/** Ответ liveness-проверки. */
export type LiveResponse = {
  status: 'ok';
};
