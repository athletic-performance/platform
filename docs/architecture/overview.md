# Architecture overview

Базовый инженерный контур платформы на этапе M0.

## Компоненты

```text
Next.js web
  ↓
NestJS API
  ↓
PostgreSQL
```

| Компонент   | Технология                | Назначение                                        |
| ----------- | ------------------------- | ------------------------------------------------- |
| Web         | Next.js App Router        | Клиентский web-интерфейс, стартовый статус-экран  |
| API         | NestJS modular monolith   | REST API, health/version, будущая доменная логика |
| Database    | PostgreSQL                | Единый source of truth                            |
| Web hosting | Vercel                    | Staging/preview для `apps/web`                    |
| API hosting | Fly.io                    | Staging для `apps/api`                            |
| CI/CD       | GitHub Actions            | Validation pipeline, дальнейший container/deploy  |
| Images      | GitHub Container Registry | Хранение API images (`ghcr.io`)                   |

## Локальный контур

```text
apps/web  (http://localhost:3000)
  → apps/api (http://localhost:3001)
    → PostgreSQL (docker compose)
```

## Границы M0

На этапе foundation нет:

- авторизации;
- продуктовой схемы БД;
- платежей и подписок;
- worker / Redis / object storage;
- отдельного admin-приложения.

## Репозиторий

```text
apps/web          — frontend
apps/api          — backend
packages/config   — общие TS/ESLint конфигурации
packages/api-client — минимальный клиент технических endpoints
docs/             — архитектура, ADR, планы этапов
infra/            — место для будущих infra-артефактов
```

## Deployment flow

```text
Merge to main
  → GitHub Actions validation
  → API image build и публикация в GHCR/Fly Registry
  → Fly.io staging API deploy по commit SHA
  → staging PostgreSQL migrations
  → Vercel deployment
  → staging smoke test
```

GitHub Actions workflow `.github/workflows/publish-api-image.yml` выполняет
validation, публикацию API image, deployment в Fly.io, staging migrations и
smoke test. Vercel deployment запускается интеграцией GitHub → Vercel, а smoke
test ожидает успешный Vercel status для проверяемого commit.

Rollback API выполняется на ранее опубликованный image с commit SHA. Подробный
порядок deployment и rollback приведён в
[операционной документации](../operations/deployment-and-rollback.md).
