# syntax=docker/dockerfile:1

# Контекст сборки — корень монорепозитория:
# docker build -f apps/web/Dockerfile -t platform-web:local .

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable \
  && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

# Устанавливаем зависимости web и его workspace-графа отдельным слоем.
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile --filter web... --ignore-scripts

# Собираем web и необходимые workspace-пакеты.
FROM deps AS build

COPY apps/web ./apps/web
COPY packages/api-client ./packages/api-client
COPY packages/config ./packages/config

RUN mkdir -p apps/web/public \
  && pnpm turbo run build --filter=web...

# Runtime содержит только standalone-сервер и статические файлы Next.js.
FROM node:22-bookworm-slim AS runner

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home nextjs

WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
