# syntax=docker/dockerfile:1.7-labs

FROM node:24.12.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ARG PACKAGE_NAME
ENV PACKAGE_NAME=$PACKAGE_NAME
ARG NUXT_DOMAIN_APP
ENV NUXT_DOMAIN_APP=$NUXT_DOMAIN_APP

FROM base AS turbo
RUN pnpm add -g turbo
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

FROM turbo AS prune
WORKDIR /usr/src/app/pruned
COPY . .
RUN turbo prune $PACKAGE_NAME --docker

# Build stage -----

FROM turbo AS prebuild
WORKDIR /usr/src/app/build
COPY --from=prune /usr/src/app/pruned/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=prune /usr/src/app/pruned/out/full/ .
RUN turbo run generate

FROM prebuild AS build
WORKDIR /usr/src/app/build
RUN turbo run build

FROM build AS deploy
WORKDIR /usr/src/app/build
RUN pnpm deploy --filter=$PACKAGE_NAME --legacy --prod /usr/src/app/deploy

# Production images -----

FROM base AS api
WORKDIR /usr/app
COPY --from=deploy /usr/src/app/deploy .
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS admin
WORKDIR /usr/app
COPY --from=deploy /usr/src/app/deploy .
EXPOSE 3000
CMD [ "pnpm", "start" ]

# Development images -----

FROM base AS orm-dev
WORKDIR /usr/app
COPY --from=prebuild /usr/src/app/build .
WORKDIR /usr/app/packages/orm
EXPOSE 3000
CMD [ "pnpm", "db:studio" ]

FROM base AS api-dev
WORKDIR /usr/app
COPY --from=prebuild /usr/src/app/build .
WORKDIR /usr/app/apps/api
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS admin-dev
WORKDIR /usr/app
COPY --from=prebuild /usr/src/app/build .
WORKDIR /usr/app/apps/admin
EXPOSE 3000
CMD [ "pnpm", "dev" ]