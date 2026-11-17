FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/discord-bot ./apps/discord-bot
COPY packages/api ./packages/api

RUN pnpm install --frozen-lockfile
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --legacy --filter discord-bot --prod /prod

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /prod/dist ./dist
COPY --from=build /prod/node_modules ./dist/node_modules

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
