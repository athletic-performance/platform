# Roadmap — завершение M0 и переход к M1

> Текущее состояние: локальная инженерная часть M0 завершена.
>
> Осталось закрыть инфраструктурную часть Engineering Foundation.
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

- [ ] Docker image
- [ ] Secrets
- [ ] Health Checks
- [ ] Rollback

## Результат

Рабочий staging API.

---

# FND-006 — Staging PostgreSQL

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

---

# FND-007 — Secrets

## Нужно

Разделить

- [ ] local
- [ ] staging
- [ ] production

Настроить

- [ ] GitHub Actions secrets / variables
- [ ] Fly Secrets
- [ ] Vercel Environment Variables

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
