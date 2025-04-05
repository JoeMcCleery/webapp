# syntax=docker/dockerfile:1.7-labs

FROM node:lts-slim AS base
RUN apt-get update -y && apt-get install -y openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY --parents ./apps/*/package.json .
COPY --parents ./libs/*/package.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm deploy --filter=@apps/api /apps/api
RUN pnpm deploy --filter=@libs/db /libs/db

FROM base AS api
WORKDIR /usr/app
COPY --from=build /apps/api .
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS prisma-studio
WORKDIR /usr/app/
COPY --from=build /libs/db .
EXPOSE 5555
CMD [ "pnpm", "db:studio"]