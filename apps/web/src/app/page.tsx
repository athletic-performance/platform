import { fetchSystemStatus } from '@/shared/api/system-status';

export const dynamic = 'force-dynamic';

function statusClass(value: string): string {
  if (['healthy', 'connected'].includes(value)) {
    return 'ok';
  }

  if (['disconnected', 'unknown'].includes(value)) {
    return 'warn';
  }

  return 'err';
}

export default async function HomePage() {
  const status = await fetchSystemStatus();

  return (
    <main>
      <h1>Platform</h1>
      <p className="lead">
        Инженерный контур M0: состояние frontend, API и PostgreSQL без продуктовой бизнес-логики.
      </p>

      <section className="panel" aria-live="polite">
        <ul className="status-list">
          <li className="status-item">
            <span className="label">Web</span>
            <span className={`value ${statusClass(status.web)}`}>{status.web}</span>
          </li>
          <li className="status-item">
            <span className="label">API</span>
            <span className={`value ${statusClass(status.api)}`}>{status.api}</span>
          </li>
          <li className="status-item">
            <span className="label">Database</span>
            <span className={`value ${statusClass(status.database)}`}>{status.database}</span>
          </li>
          <li className="status-item">
            <span className="label">Version</span>
            <span className="value">{status.version ?? '—'}</span>
          </li>
          <li className="status-item">
            <span className="label">Commit</span>
            <span className="value">{status.commitSha ?? '—'}</span>
          </li>
        </ul>

        {status.errorMessage ? (
          <div className="error-box">
            <strong>Error state</strong>
            <div>{status.errorMessage}</div>
            {status.requestId ? <div>requestId: {status.requestId}</div> : null}
          </div>
        ) : null}

        <p className="meta">
          Источник: <code>GET /health/ready</code> и <code>GET /version</code>
        </p>
      </section>
    </main>
  );
}
