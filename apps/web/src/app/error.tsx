'use client';

import { faro } from '@grafana/faro-web-sdk';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    faro.api?.pushError(error);
  }, [error]);

  return (
    <main>
      <h1>Platform</h1>
      <p className="lead">Не удалось отрисовать стартовый экран.</p>
      <section className="panel">
        <div className="error-box">
          <strong>Error state</strong>
          <div>{error.message}</div>
        </div>
        <p className="meta">
          <button type="button" onClick={reset}>
            Повторить
          </button>
        </p>
      </section>
    </main>
  );
}
