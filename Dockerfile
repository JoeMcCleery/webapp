# syntax=docker/dockerfile:1.7-labs

FROM node:22.14.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ARG PACKAGE_NAME
ENV PACKAGE_NAME=$PACKAGE_NAME

FROM base AS turbo
RUN pnpm add -g turbo
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

FROM turbo AS prune
WORKDIR /usr/src/app/pruned
# Get files required for building specific package
COPY . .
RUN turbo prune $PACKAGE_NAME --docker

FROM turbo AS build
WORKDIR /usr/src/app/build
# Install dependencies
COPY --from=prune /usr/src/app/pruned/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Build
COPY --from=prune /usr/src/app/pruned/out/full/ .
RUN turbo run generate
# RUN turbo run build

FROM base AS deploy
WORKDIR /usr/src/app/build
# Copy built files
COPY --from=build /usr/src/app/build .
# Deploy
RUN pnpm deploy --filter=$PACKAGE_NAME --legacy /usr/src/app/deploy

FROM base AS orm
WORKDIR /usr/app
COPY --from=deploy /usr/src/app/deploy .
EXPOSE 3000
CMD [ "pnpm", "db:studio" ]

FROM base AS api
WORKDIR /usr/app
COPY --from=deploy /usr/src/app/deploy .
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS admin
WORKDIR /usr/app
COPY --from=deploy /usr/src/app/deploy .
EXPOSE 3000
CMD [ "pnpm", "dev" ]
