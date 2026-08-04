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
| CI/CD       | GitLab CI/CD              | Validation pipeline, дальнейший container/deploy  |
| Images      | GitLab Container Registry | Хранение API images                               |

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

## Deployment flow (целевой для закрытия M0)

```text
Merge to main
  → GitLab CI validation
  → API image build
  → GitLab Container Registry
  → Fly.io staging
  → Vercel staging
  → smoke test
```

Локальный bootstrap и validation pipeline входят в первый логический MR.
Публикация image, staging deploy, smoke test и error tracking оформляются
отдельными foundation-задачами после initial commit.
