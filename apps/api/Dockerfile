# syntax=docker/dockerfile:1

# Build context: monorepo root
#   docker build -f apps/api/Dockerfile -t platform-api:local .

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# OpenSSL нужен Prisma Client и в build (generate), и в runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# ---------------------------------------------------------------------------
# Install workspace dependencies for api (+ workspace package graph)
# ---------------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/api-client/package.json ./packages/api-client/

# postinstall api требует .env — в image его нет; generate делаем явно ниже
RUN pnpm install --frozen-lockfile --filter api... --ignore-scripts

# ---------------------------------------------------------------------------
# Generate Prisma Client + NestJS build
# ---------------------------------------------------------------------------
FROM deps AS build

COPY packages/config ./packages/config
COPY apps/api ./apps/api

# Нужен только чтобы prisma generate прочитал env("DATABASE_URL") из schema.
# Реальная БД на этапе сборки не используется; .env в image не копируется.
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"

RUN pnpm --filter api exec prisma generate \
  && pnpm --filter api build \
  # deploy переустанавливает prod-deps; scripts отключаем иначе postinstall \
  # api ищет ../../.env и generate уходит не в /app/deploy
  && pnpm --filter api deploy --prod --legacy /app/deploy --config.ignore-scripts=true \
  && cp -R /app/apps/api/dist /app/deploy/dist \
  && cp -R /app/apps/api/prisma /app/deploy/prisma \
  # generate в runtime-дерево; CLI из build-stage workspace (в prod-deps prisma нет)
  && pnpm --filter api exec prisma generate --schema=/app/deploy/prisma/schema.prisma

# ---------------------------------------------------------------------------
# Production runtime
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home api

WORKDIR /app

ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=3001

COPY --from=build --chown=api:nodejs /app/deploy ./

USER api

EXPOSE 3001

# curl в slim-образе нет — используем встроенный fetch Node.js
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.API_PORT||3001)+'/health/live').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "dist/main.js"]
