# Platform

Инженерный монорепозиторий фитнес-платформы (`athletic-performance/platform`).

Текущий этап: **M0 — Engineering Foundation**.
Продуктовая бизнес-логика на этом этапе отсутствует.

## Требования

- Node.js 22+
- pnpm 10.14.0 (через Corepack)
- Docker + Docker Compose
- Git.

## Быстрый старт

```bash
git clone git@github.com:athletic-performance/platform.git
cd platform
cp .env.example .env
corepack enable
corepack prepare pnpm@10.14.0 --activate
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

После запуска:

- Web: http://localhost:3000
- API: http://localhost:3001
- `GET /health/live`
- `GET /health/ready`
- `GET /version`

## Структура

```text
apps/web              Next.js App Router
apps/api              NestJS API
packages/config       общие TypeScript/ESLint конфиги
packages/api-client   клиент технических endpoints
docs/                 планы, architecture, ADR
infra/                infra-артефакты (пока зарезервировано)
```

## Переменные окружения

Скопируйте `.env.example` → `.env`.

- Backend/DB: `DATABASE_URL`, `API_PORT`, `CORS_ORIGINS`, `COMMIT_SHA`, ...
- Frontend: только `NEXT_PUBLIC_*` (например `NEXT_PUBLIC_API_BASE_URL`)
- Реальные secrets не коммитятся

## Команды

| Команда           | Назначение                  |
| ----------------- | --------------------------- |
| `pnpm dev`        | web + api                   |
| `pnpm lint`       | ESLint                      |
| `pnpm format`     | Prettier                    |
| `pnpm typecheck`  | строгая проверка TypeScript |
| `pnpm test`       | unit-тесты                  |
| `pnpm build`      | production build            |
| `pnpm db:up`      | поднять PostgreSQL          |
| `pnpm db:migrate` | применить миграции          |

## Branch flow

1. Первый bootstrap commit может быть запушен в `main` один раз.
2. Дальше только Pull Requests.
3. `main` защищается: no direct push, no force push, required checks, squash merge.

## Staging URLs

После foundation-задач на staging:

- Web: Vercel staging URL (заполняется после FND-004)
- API: Fly.io staging URL (заполняется после FND-005)

## Типичные ошибки

| Симптом                       | Что проверить                                           |
| ----------------------------- | ------------------------------------------------------- |
| `DATABASE_URL` / config error | файл `.env`, значения из `.env.example`                 |
| `/health/ready` = 503         | `docker compose ps`, логи PostgreSQL, `pnpm db:migrate` |
| Web не видит API              | `NEXT_PUBLIC_API_BASE_URL`, `CORS_ORIGINS`, порт API    |
| pnpm/engine errors            | Node 22+, `corepack prepare pnpm@10.14.0 --activate`    |

## Документация

- [M0 Engineering Foundation](docs/m0-engineering-foundation.md)
- [M0 completion roadmap](docs/m0-completion-roadmap.md)
- [Architecture overview](docs/architecture/overview.md)
- [ADR](docs/adr/README.md)
- [Implementation methodology](docs/implementation-methodology.md)
