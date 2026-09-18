# Deployment и rollback staging

Документ описывает фактический staging-контур M0:

```text
Vercel web
    ↓
Fly.io API
    ↓
staging PostgreSQL
```

## Deployment flow

После push в `main` workflow `.github/workflows/publish-api-image.yml` выполняет
следующие jobs:

```text
validate
  ↓
publish-api
  ↓
deploy-staging-api
  ↓
migrate-staging
  ↓
smoke-test
```

`publish-api` собирает API image и публикует его в GitHub Container Registry и
Fly Registry с тегом commit SHA. `deploy-staging-api` разворачивает этот
immutable image в приложении `athletic-performance-api-staging` и передаёт
`COMMIT_SHA`. Затем `migrate-staging` применяет Prisma migrations к staging
PostgreSQL.

Vercel получает deployment через интеграцию с GitHub. Smoke test ожидает
успешный Vercel status для того же commit и проверяет frontend, API liveness,
API readiness, подключение PostgreSQL и `/version`.

## Rollback API

API откатывается на ранее опубликованный image с известным commit SHA. Сначала
нужно выбрать SHA из успешного deployment или списка Fly.io releases, затем
выполнить:

```bash
flyctl deploy \
  --config fly.toml \
  --app athletic-performance-api-staging \
  --image registry.fly.io/athletic-performance-api-staging:<commit-sha> \
  --yes
```

После rollback необходимо проверить:

```bash
curl --fail https://athletic-performance-api-staging.fly.dev/health/live
curl --fail https://athletic-performance-api-staging.fly.dev/health/ready
curl --fail https://athletic-performance-api-staging.fly.dev/version
```

`/version` должен вернуть SHA откатированного image. Миграции PostgreSQL
не откатываются автоматически: перед rollback нужно убедиться, что schema
совместима с выбранной версией API.

## Staging URLs

- Web: https://platform-web-five-psi.vercel.app
- API: https://athletic-performance-api-staging.fly.dev
- API liveness: https://athletic-performance-api-staging.fly.dev/health/live
- API readiness: https://athletic-performance-api-staging.fly.dev/health/ready
- API version: https://athletic-performance-api-staging.fly.dev/version
