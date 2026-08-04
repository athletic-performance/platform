# M0 — Engineering Foundation

## Цель этапа

Подготовить воспроизводимую инженерную основу проекта, на которой два разработчика смогут безопасно вести дальнейшую
разработку через GitLab, Merge Requests и CI/CD.

Этап не включает продуктовую бизнес-логику:

- авторизацию пользователей;
- тренировочные программы;
- упражнения;
- тренировки;
- платежи;
- подписки и доступы;
- продуктовую схему базы данных.

## Конечный результат

К завершению этапа должен работать полный технический контур:

```text
Vercel
  ↓
Next.js web
  ↓
Fly.io
  ↓
NestJS API
  ↓
PostgreSQL
```

На staging-странице отображается:

```text
Web: healthy
API: healthy
Database: connected
Version: <commit-sha>
```

---

# 1. Текущее состояние

Уже выполнено:

- создана GitLab Group `athletic-performance`;
- создан репозиторий `platform`;
- настроен SSH-доступ;
- Андрей имеет роль `Owner`;
- Игорь приглашён с ролью `Developer`;
- принято решение не зависеть от GitLab Ultimate;
- репозиторий пустой и готов к первому коммиту.

---

# 2. Локальный bootstrap репозитория

## 2.1. Клонировать репозиторий

```bash
mkdir -p ~/projects
cd ~/projects

git clone git@gitlab.com:athletic-performance/platform.git
cd platform
```

Проверить:

```bash
git remote -v
git status
```

## 2.2. Создать структуру монорепозитория

```text
platform/
  apps/
    web/
    api/

  packages/
    config/
    api-client/

  docs/
    architecture/
    adr/

  infra/

  package.json
  pnpm-workspace.yaml
  turbo.json
  pnpm-lock.yaml
  docker-compose.yml
  .gitignore
  .editorconfig
  .env.example
  README.md
```

На этом этапе не создавать:

- `packages/ui`;
- `apps/worker`;
- Redis;
- object storage;
- продуктовые Prisma-модели;
- отдельное admin-приложение.

## 2.3. Настроить pnpm workspace

Требования:

- один `pnpm-lock.yaml`;
- приложения и пакеты входят в workspace;
- команды запускаются из корня;
- используется актуальная закреплённая версия pnpm.

## 2.4. Настроить Turborepo

Из корня должны выполняться:

```bash
pnpm dev
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm build
```

Turborepo должен:

- учитывать зависимости workspace-пакетов;
- кешировать `lint`, `typecheck`, `test` и `build`;
- не кешировать `dev`;
- не коммитить локальный `.turbo` cache.

---

# 3. Общие инженерные стандарты

## 3.1. TypeScript

Настроить:

- общий базовый `tsconfig`;
- отдельные конфигурации для web и API;
- строгий режим;
- `noImplicitAny`;
- `noUncheckedIndexedAccess`, если не создаёт несовместимость с выбранными библиотеками;
- отдельную команду `typecheck`, не зависящую от production build.

Не использовать `any`.

## 3.2. ESLint и formatter

Настроить:

- общую конфигурацию;
- проверку web и API;
- отсутствие конфликтов между ESLint и formatter;
- падение CI при lint-ошибках;
- форматирование через отдельную команду.

## 3.3. EditorConfig

Добавить единые правила:

- UTF-8;
- LF;
- финальная новая строка;
- отступы;
- удаление trailing spaces.

## 3.4. Environment variables

Создать `.env.example`.

Правила:

- реальные secrets не коммитятся;
- frontend-переменные отделены от backend-переменных;
- публичные переменные Next.js явно имеют префикс `NEXT_PUBLIC_`;
- обязательные переменные валидируются при старте приложения;
- пустые или отсутствующие значения приводят к понятной ошибке.

## 3.5. Git hooks

На первом этапе не обязательны:

- Husky;
- commitlint;
- сложные pre-commit hooks.

Основной контроль выполняет CI.

---

# 4. Frontend

## 4.1. Создать `apps/web`

Использовать:

- Next.js;
- App Router;
- React;
- TypeScript;
- строгий режим.

## 4.2. Минимальная структура

```text
apps/web/src/
  app/
  shared/
    config/
    api/
```

Пока не создавать преждевременную feature-архитектуру для несуществующих бизнес-модулей.

## 4.3. Стартовый экран

Экран должен отображать:

- состояние frontend;
- состояние API;
- состояние базы данных;
- версию API;
- loading state;
- error state.

## 4.4. Production build

Должны работать:

```bash
pnpm --filter web dev
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build
```

## 4.5. Dockerfile для web

Production Dockerfile для web не входит в обязательный критический путь M0, потому что основной hosting — Vercel.

Его можно добавить в конце этапа как portability fallback, если это не задерживает staging.

Требования при реализации:

- multi-stage build;
- standalone output Next.js;
- non-root user;
- минимальный production image;
- отсутствие dev dependencies.

---

# 5. Backend

## 5.1. Создать `apps/api`

Использовать:

- NestJS;
- TypeScript;
- модульную структуру;
- REST;
- глобальную валидацию;
- graceful shutdown.

## 5.2. Технические endpoints

Добавить:

```text
GET /health/live
GET /health/ready
GET /version
```

### `/health/live`

Проверяет, что процесс API запущен.

Не должен зависеть от PostgreSQL.

### `/health/ready`

Проверяет, что API готов обслуживать запросы.

Должен учитывать соединение с PostgreSQL.

### `/version`

Возвращает:

```json
{
  "service": "api",
  "version": "0.0.0",
  "commitSha": "..."
}
```

## 5.3. Graceful shutdown

API должен корректно обрабатывать:

```text
SIGTERM
SIGINT
```

Перед остановкой:

- прекращать принимать новые запросы;
- корректно закрывать соединение с БД;
- завершать процесс без зависания.

## 5.4. Production build

Должны работать:

```bash
pnpm --filter api dev
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api build
```

---

# 6. Локальный PostgreSQL

## 6.1. Docker Compose

Добавить PostgreSQL в `docker-compose.yml`.

Пока не добавлять:

- Redis;
- Kafka;
- RabbitMQ;
- MinIO;
- Mailpit;
- worker.

## 6.2. Требования

PostgreSQL должен иметь:

- закреплённую major-версию;
- named volume;
- health check;
- настройки через `.env`;
- отдельную локальную БД;
- отсутствие production credentials.

Проверка:

```bash
docker compose up -d
docker compose ps
```

## 6.3. ORM и migrations

Подключить выбранную ORM.

На первом этапе создать только минимальную техническую миграцию.

Не создавать пока таблицы:

- программ;
- тренировок;
- упражнений;
- покупок;
- доступов;
- результатов;
- обратной связи.

Продуктовая схема зависит от ещё не закрытых бизнес-решений.

---

# 7. Интеграция web → API → database

## 7.1. Подключить API к PostgreSQL

`GET /health/ready` должен:

- возвращать `200`, когда PostgreSQL доступен;
- возвращать ошибку готовности, когда PostgreSQL недоступен;
- не раскрывать credentials или внутренние детали подключения.

## 7.2. Подключить frontend к API

Frontend должен обращаться к:

```text
GET /version
GET /health/ready
```

## 7.3. Настроить CORS

Разрешить только известные origins:

- local web;
- Vercel staging;
- позднее production domain.

Не использовать unrestricted `*` вместе с credentials.

## 7.4. Локальная проверка

С чистого состояния должны работать:

```bash
pnpm install
docker compose up -d
pnpm dev
```

Отдельно:

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm build
```

---

# 8. Structured logging и correlation ID

## 8.1. Structured logging

Backend должен писать структурированные логи.

В production — JSON.

Минимальные поля:

```text
timestamp
level
service
environment
requestId
method
path
statusCode
duration
```

## 8.2. Correlation ID

Для каждого HTTP-запроса:

- принимать существующий correlation ID из разрешённого заголовка;
- либо генерировать новый;
- добавлять его в backend logs;
- возвращать в response header;
- включать в безопасный API error response.

## 8.3. Ограничения логирования

Не логировать:

- secrets;
- access tokens;
- пароли;
- connection strings;
- полные request body;
- будущие health-данные пользователей;
- payment payload целиком.

---

# 9. Документация

## 9.1. README

README должен позволять Игорю с чистой машины выполнить:

```bash
git clone git@gitlab.com:athletic-performance/platform.git
cd platform
pnpm install
docker compose up -d
pnpm dev
```

README должен содержать:

- требования к Node.js, pnpm и Docker;
- структуру репозитория;
- команды;
- настройку `.env`;
- локальный запуск;
- запуск проверок;
- branch flow;
- staging URLs;
- типичные ошибки запуска.

## 9.2. ADR

Создать структуру:

```text
docs/adr/
  README.md
  0001-use-monorepository.md
  0002-use-modular-monolith.md
  0003-use-postgresql.md
```

ADR на этом этапе должны быть короткими.

Формат:

```text
Context
Decision
Consequences
```

## 9.3. Architecture baseline

Создать:

```text
docs/architecture/overview.md
```

Зафиксировать:

```text
Next.js web
NestJS API
PostgreSQL
Vercel
Fly.io
GitLab CI/CD
GitLab Container Registry
```

---

# 10. Первый commit

После завершения локального bootstrap:

```bash
git add .
git commit -m "chore: initialize platform monorepository"
git push -u origin main
```

Это последний допустимый прямой push в `main`.

---

# 11. Настройка GitLab

## 11.1. Защитить `main`

Настроить:

- запрет прямого push;
- запрет force push;
- изменения только через Merge Request;
- обязательный успешный pipeline;
- squash merge;
- удаление source branch после merge.

## 11.2. Merge Request template

Добавить шаблон с блоками:

```text
What changed
Why
How to test
Risks
Checklist
```

## 11.3. Issue templates

Минимально:

```text
Task
Bug
Decision
```

## 11.4. Milestone

Создать:

```text
M0 — Engineering Foundation
```

## 11.5. Labels

### Status

```text
status::backlog
status::ready
status::in-progress
status::review
status::ready-for-qa
status::in-qa
status::ready-for-release
status::done
```

### Area

```text
area::frontend
area::backend
area::database
area::infrastructure
area::qa
area::docs
```

### Priority

```text
priority::p0
priority::p1
priority::p2
priority::p3
```

### Type

```text
type::task
type::bug
type::decision
```

---

# 12. Foundation backlog

После initial commit создать Issues:

## FND-001 — Configure GitLab CI validation pipeline

Acceptance criteria:

- pipeline запускается для Merge Request;
- используется frozen lockfile;
- выполняются `lint`, `typecheck`, `test`, `build`;
- устаревший pipeline отменяется после нового push;
- merge блокируется при ошибке pipeline.

## FND-002 — Add API production Dockerfile

Acceptance criteria:

- multi-stage build;
- production dependencies;
- non-root user;
- graceful shutdown;
- image собирается из корня монорепозитория;
- health endpoint доступен внутри контейнера.

## FND-003 — Publish API image to GitLab Container Registry

Acceptance criteria:

- image собирается после merge в `main`;
- image получает immutable tag по commit SHA;
- image сохраняется в GitLab Container Registry;
- deployment не зависит только от `latest`.

Пример:

```text
registry.gitlab.com/athletic-performance/platform/api:<commit-sha>
```

## FND-004 — Deploy web staging to Vercel

Acceptance criteria:

- GitLab repository подключён к Vercel;
- root directory указывает на `apps/web`;
- Merge Request получает preview deployment;
- staging variables отделены от local variables;
- frontend обращается к staging API.

## FND-005 — Deploy API staging to Fly.io

Acceptance criteria:

- API разворачивается из Docker image;
- настроены health checks;
- staging secrets не находятся в Git;
- deployment воспроизводим;
- API возвращает commit SHA через `/version`.

## FND-006 — Provision staging PostgreSQL

Acceptance criteria:

- staging database отделена от local и production;
- API и БД находятся в совместимом регионе;
- credentials хранятся в secrets;
- migrations применяются контролируемо;
- включено резервное копирование, если оно поддерживается выбранным тарифом.

## FND-007 — Configure staging secrets

Acceptance criteria:

- local, staging и будущие production variables разделены;
- GitLab CI variables имеют корректный scope;
- Vercel variables разделены по environment;
- Fly.io secrets настроены через secret storage;
- secrets отсутствуют в logs и repository.

## FND-008 — Add staging smoke test

Acceptance criteria:

- frontend URL доступен;
- `/health/live` отвечает;
- `/health/ready` подтверждает PostgreSQL;
- `/version` возвращает ожидаемый commit SHA;
- frontend успешно получает ответ API;
- smoke test запускается после deployment.

## FND-009 — Add structured logging and correlation ID

Acceptance criteria:

- backend logs структурированы;
- каждый запрос имеет request ID;
- ID возвращается клиенту;
- чувствительные данные не логируются;
- ошибки можно связать с конкретным запросом.

## FND-010 — Configure dependency update automation

Использовать Renovate или аналог, совместимый с GitLab Free.

Acceptance criteria:

- frontend, backend и tooling dependencies разделены;
- major updates не мержатся автоматически;
- update MR проходят полный pipeline;
- частота обновлений не создаёт постоянный шум.

## FND-011 — Connect error tracking

Acceptance criteria:

- frontend и backend errors разделены;
- передаются environment и release;
- sourcemaps доступны error tracking системе, но не публикуются небезопасно;
- тестовая staging-ошибка отображается;
- персональные и health-данные не отправляются.

## FND-012 — Add web production Dockerfile

Приоритет ниже остальных Foundation-задач.

Acceptance criteria:

- multi-stage;
- Next.js standalone output;
- non-root user;
- production image запускается локально;
- Dockerfile не используется как обязательное условие Vercel deployment.

## FND-013 — Complete staging walking skeleton

Acceptance criteria:

- Vercel web обращается к Fly.io API;
- Fly.io API подключается к staging PostgreSQL;
- frontend показывает корректные состояния;
- staging-контур не зависит от локальной машины;
- smoke test проходит после чистого deployment.

## FND-014 — Complete Foundation documentation

Acceptance criteria:

- README проверен вторым разработчиком;
- ADR зафиксированы;
- architecture overview актуален;
- описан deployment flow;
- описан rollback;
- указаны staging URLs.

---

# 13. GitLab CI/CD

## 13.1. Validation pipeline

Для каждого Merge Request:

```text
install
  ↓
lint
  ↓
typecheck
  ↓
test
  ↓
build
```

Дополнительно:

- проверка миграций;
- кеширование pnpm store;
- отмена устаревших pipeline;
- сохранение build artifacts только при необходимости.

## 13.2. Container pipeline

После merge в `main`:

```text
validate
  ↓
build API image
  ↓
push image to GitLab Registry
```

## 13.3. Deployment pipeline

После публикации image:

```text
deploy staging API
  ↓
apply staging migrations
  ↓
run smoke test
```

Production deployment на M0 не обязателен.

---

# 14. Staging deployment

## 14.1. Vercel

Развернуть:

```text
apps/web
```

Настроить:

- preview deployments для Merge Requests;
- staging API URL;
- отдельные environment variables;
- production deployment пока не является целью M0.

## 14.2. Fly.io

Развернуть:

```text
apps/api
```

Настроить:

- Docker image;
- health checks;
- secrets;
- deployment command;
- rollback;
- логирование.

## 14.3. PostgreSQL

Создать отдельную staging database.

Не использовать:

- local database;
- будущую production database;
- одну общую БД для всех сред.

---

# 15. Error tracking

Подключить error tracking после появления staging.

Минимально:

- frontend runtime errors;
- backend exceptions;
- release по commit SHA;
- environment;
- correlation ID;
- тестовое событие;
- фильтрация чувствительных данных.

Error tracking не должен блокировать первый local commit, но должен быть завершён до закрытия M0.

---

# 16. Dependency automation

Настроить Renovate либо другой совместимый инструмент.

Правила:

- не мержить major updates автоматически;
- не обновлять всё одним огромным MR;
- группировать связанные tooling dependencies;
- запускать полный CI;
- закреплять runtime major versions.

---

# 17. Production environment

Production infrastructure не является обязательной частью M0.

На этом этапе достаточно:

```text
local
preview
staging
```

Production создаётся перед первым реальным пользовательским релизом.

Исключение — можно заранее создать пустые protected environments и зарезервировать названия, но не поднимать
оплачиваемую инфраструктуру без необходимости.

---

# 18. Критерии завершения M0

Этап завершён только при выполнении всех условий:

- [ ] Репозиторий содержит `apps/web` и `apps/api`.
- [ ] Настроены pnpm workspace и Turborepo.
- [ ] Все приложения используют строгий TypeScript.
- [ ] Работают root-команды `dev`, `lint`, `format`, `typecheck`, `test`, `build`.
- [ ] PostgreSQL запускается локально через Docker Compose.
- [ ] API подключается к PostgreSQL.
- [ ] Реализованы `/health/live`, `/health/ready`, `/version`.
- [ ] Frontend получает состояние API и базы данных.
- [ ] Добавлены structured logging и correlation ID.
- [ ] Создан initial commit и отправлен в GitLab.
- [ ] `main` защищён.
- [ ] Следующие изменения проходят через Merge Requests.
- [ ] GitLab CI проверяет каждый Merge Request.
- [ ] API production image собирается.
- [ ] API image публикуется в GitLab Container Registry.
- [ ] Web развёрнут на Vercel staging.
- [ ] API развёрнут на Fly.io staging.
- [ ] Создана отдельная staging PostgreSQL.
- [ ] Secrets разделены между local и staging.
- [ ] Smoke test проходит.
- [ ] Error tracking получает тестовые frontend и backend ошибки.
- [ ] Настроено автоматическое обновление зависимостей.
- [ ] README позволяет Игорю поднять проект с чистой машины.
- [ ] Созданы базовые ADR и architecture overview.

---

# 19. Definition of Done этапа

M0 считается завершённым, когда после нового merge в `main` автоматически происходит:

```text
GitLab CI validation
  ↓
API image build
  ↓
GitLab Container Registry
  ↓
Fly.io staging deployment
  ↓
Vercel staging deployment
  ↓
Smoke test
```

И staging-страница показывает:

```text
Web: healthy
API: healthy
Database: connected
Version: <commit-sha>
```

После этого можно переходить к следующему этапу:

```text
M1 — Product and Architecture Freeze
```

До закрытия M0 не начинать реализацию авторизации, платежей, программ, тренировок и продуктовой схемы базы данных.
