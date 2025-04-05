# syntax=docker/dockerfile:1.7-labs

FROM node:lts-slim AS base
RUN apt-get update -y && apt-get install -y openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS setup
WORKDIR /usr/src/app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY --parents ./packages/*/package.json ./

FROM setup AS build
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS api-dev
WORKDIR /usr/app
COPY --from=build /usr/src/app .
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS prisma-studio
WORKDIR /usr/app
COPY --from=build /usr/src/app .
EXPOSE 5555
CMD [ "pnpm", "prisma:studio"]