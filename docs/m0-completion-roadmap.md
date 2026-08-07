# Roadmap — завершение M0 и переход к M1

> Текущее состояние: FND-001 — FND-007 завершены.
>
> Следующий этап: FND-008 — Smoke Test.
>
> Источник истины по содержанию этапа: `docs/m0-engineering-foundation.md`.
> Этот файл — план доделки оставшихся инфраструктурных пунктов M0 после миграции с GitLab на GitHub.

---

# M0 — Engineering Foundation

## ✅ Уже выполнено

### GitHub

- [x] Создана GitHub Organization / репозиторий
- [x] Настроен SSH
- [x] Добавлен второй разработчик

### Репозиторий

- [x] pnpm Workspace
- [x] Turborepo
- [x] Monorepo

### Frontend

- [x] Next.js
- [x] App Router
- [x] TypeScript
- [x] Стартовая страница

### Backend

- [x] NestJS
- [x] Health endpoints
- [x] Version endpoint

### Database

- [x] PostgreSQL
- [x] Prisma
- [x] Подключение API

### Engineering

- [x] ESLint
- [x] Formatter
- [x] Strict TypeScript
- [x] Structured Logging
- [x] Correlation ID

### Первый push

- [x] Initial commit
- [x] Репозиторий собран
- [x] Код запушен

---

# Осталось выполнить

---

# FND-001 — GitHub Actions Validation

## Цель

Настроить полноценную проверку Pull Request.

## Нужно

- [x] проверить Workflow
- [x] install
- [x] lint
- [x] typecheck
- [x] test
- [x] build
- [x] prisma validate
- [x] frozen lockfile
- [x] cache pnpm
- [x] cancel outdated runs (concurrency)

## Результат

Любой Pull Request автоматически проходит инженерную проверку.

Реализация: `.github/workflows/ci.yml`.

---

# FND-002 — API Dockerfile

## Нужно

- [x] multi-stage
- [x] production image
- [x] non-root user
- [x] graceful shutdown
- [x] health endpoint внутри контейнера

## Результат

API полностью контейнеризирован.

Реализация: `apps/api/Dockerfile`, корневой `.dockerignore`.

---

# FND-003 — GitHub Container Registry

## Нужно

После merge в main

- [ ] build Docker image
- [ ] push image в GHCR (`ghcr.io`)

Получать

```
api:latest

api:<commit-sha>
```

## Результат

Backend готов к деплою.

---

# FND-004 — Vercel

## Нужно

Подключить

```
GitHub
    ↓
Vercel
```

Настроить

- [ ] Preview Deployments (Vercel UI: import `athletic-performance/platform`)
- [x] apps/web (конфиг: `apps/web/vercel.json`, `apps/web/.nvmrc`; Root Directory в UI: `apps/web`)
- [ ] staging env = Vercel Preview Environment (отдельная ветка не создаётся)
- [ ] API URL: в Preview создать `NEXT_PUBLIC_API_BASE_URL` без реального staging API URL

## Результат

Рабочий staging frontend.

Репозиторий подготовлен: `apps/web/vercel.json`, `apps/web/.nvmrc`, инструкции в README.
Подключение GitHub → Vercel и env в Preview — вручную в UI.

---

# FND-005 — Fly.io

## Нужно

Развернуть API

Настроить

- [x] Docker image
- [x] Secrets
- [x] Health Checks
- [x] Rollback

## Результат

Рабочий staging API.

## Фактический результат

- staging API: `https://athletic-performance-api-staging.fly.dev`;
- primary region: `ams`;
- запущена одна Machine (`shared-cpu-1x`, `256mb`);
- Fly health checks проходят;
- `/health/live` возвращает HTTP 200;
- `/health/ready` возвращает HTTP 200, database up;
- `/version` возвращает актуальный commit SHA;
- путь rollback подтверждён.

## Настройка CORS_ORIGINS

- `CORS_ORIGINS` настроен на реальный Vercel staging frontend origin: `https://platform-web-five-psi.vercel.app`;
- после обновления секрета Fly Machine успешно обновилась;
- `/health/live` возвращает `{"status":"ok"}`;
- `/health/ready` возвращает `{"status":"ok","checks":{"database":"up"}}` и подтверждает, что database up;
- `/version` доступен и возвращает ожидаемый commit SHA `65215241e2e4579b6107d90fc151dc2266d481e0`.

---

# FND-006 — Staging PostgreSQL

Статус: завершён.

## Нужно

Создать отдельную staging БД.

Подключить API.

## Результат

```
Internet

↓

Vercel

↓

Fly.io

↓

PostgreSQL
```

## Фактическая реализация

- staging PostgreSQL размещён в Neon;
- используется Neon-проект `athletic-performance`;
- используется отдельная ветка Neon `staging`, переименованная из ранее созданной ветки `mr1`;
- default-ветка `production` существует, но в рамках FND-006 не используется;
- Fly.io API подключён к Neon через существующий secret `DATABASE_URL`;
- значение `DATABASE_URL`, установленное ранее во время FND-005, уже указывало на эту Neon-ветку;
- после переименования ветки повторно устанавливать secret не потребовалось.

## Проверка подключения

Команда:

```bash
curl https://athletic-performance-api-staging.fly.dev/health/ready
```

Фактический ответ:

```json
{
  "status": "ok",
  "checks": {
    "database": "up"
  }
}
```

## Итог этапа

- создана отдельная staging PostgreSQL;
- staging API успешно подключён к ней;
- staging-база не зависит от локальной машины;
- FND-006 завершён.

В рамках FND-006 Prisma Schema не менялась, новые таблицы и миграции не создавались. Успешный ответ
`/health/ready` является достаточным подтверждением подключения для текущего этапа.

---

# FND-007 — Secrets

Статус: завершён.

## Нужно

Разделить

- [x] local
- [x] staging
- [x] production

Настроить

- [x] GitHub Actions secrets / variables
- [x] Fly Secrets
- [x] Vercel Environment Variables

## Фактическая реализация

### GitHub Actions

- GitHub Actions secrets и variables проверены;
- текущие workflow не требуют пользовательских Repository Secrets или Repository Variables;
- `.github/workflows/publish-api-image.yml` использует встроенный `secrets.GITHUB_TOKEN`, который
  автоматически предоставляется GitHub Actions и не требует ручного создания;
- staging-specific GitHub Actions secrets и variables сейчас не требуются.

### Fly.io staging

- staging-приложение: `athletic-performance-api-staging`;
- чувствительные backend-значения хранятся через Fly Secrets;
- присутствуют secrets `DATABASE_URL` и `CORS_ORIGINS`;
- значения secrets не хранятся в репозитории.

### Vercel

- для frontend настроена Environment Variable
  `NEXT_PUBLIC_API_BASE_URL=https://athletic-performance-api-staging.fly.dev`;
- переменная назначена на Production и Preview текущего Vercel-проекта;
- после добавления переменной выполнен redeploy.

### Local

- локальный пример остаётся в `.env.example`:
  `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`;
- staging URL не захардкожен во frontend-коде.

### Production

- отдельная production infrastructure в рамках FND-007 не создавалась;
- production credentials, database и backend не создавались;
- staging и local значения не смешиваются с отдельными production credentials.

## Verification

После настройки Vercel через развёрнутый frontend подтверждена рабочая цепочка:

- Web: `healthy`;
- API: `healthy`;
- Database: `connected`;
- Version endpoint работает;
- Commit SHA отображается.

Эта ручная проверка фиксируется только как verification FND-007 и не закрывает FND-008.

## Итог этапа

FND-007 завершён. Следующий этап: FND-008 — Smoke Test.

---

# FND-008 — Smoke Test

## Проверить

- [ ] Frontend доступен
- [ ] Backend доступен
- [ ] Database подключена
- [ ] /health/live
- [ ] /health/ready
- [ ] /version
- [ ] Frontend успешно получает API

---

# FND-009 — Structured Logging

Проверить уже на staging

- [ ] JSON logs
- [ ] requestId
- [ ] correlationId
- [ ] отсутствие sensitive данных

---

# FND-010 — Dependency Automation

Настроить

- [ ] Dependabot
  или

- [ ] Renovate

---

# FND-011 — Error Tracking

Подключить

- [ ] Frontend
- [ ] Backend

Проверить

- [ ] release
- [ ] environment
- [ ] тестовая ошибка

---

# FND-012 — Production Dockerfile (Web)

Низкий приоритет.

Добавить

- [ ] multi-stage
- [ ] standalone
- [ ] non-root

---

# FND-013 — Complete Staging Walking Skeleton

Проверить полностью

```
Vercel

↓

Fly

↓

PostgreSQL
```

Frontend должен отображать

```
Web: healthy

API: healthy

Database: connected

Version: <commit-sha>
```

---

# FND-014 — Foundation Documentation

Проверить

- [ ] README
- [ ] ADR
- [ ] Architecture Overview
- [ ] Deployment Flow
- [ ] Rollback
- [ ] Staging URLs

---

# Definition of Done M0

Этап считается завершённым, когда автоматически работает цепочка

```
Git Push

↓

GitHub Actions

↓

Build

↓

GitHub Container Registry (GHCR)

↓

Fly.io Deploy

↓

Vercel Deploy

↓

Smoke Test
```

и staging показывает

```
Web: healthy

API: healthy

Database: connected

Version: <commit-sha>
```

---

# После завершения M0

Переходим к следующему этапу.

# M1 — Product & Architecture Freeze

Цель этапа:

- зафиксировать доменную модель;
- утвердить терминологию;
- закрыть все открытые продуктовые вопросы;
- утвердить архитектурные решения;
- подготовить финальную Prisma Schema;
- подготовить API-контракты;
- подготовить декомпозицию задач.

После завершения M1 начинается реализация продукта.

```
Auth

↓

Users

↓

Programs

↓

Workouts

↓

Exercises

↓

Payments

↓

Frontend
```
