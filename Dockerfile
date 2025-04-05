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
COPY --parents ./packages/*/package.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm deploy --filter=@web-app/api /apps/api
RUN pnpm deploy --filter=@web-app/studio /apps/studio

FROM base AS api
WORKDIR /usr/app
COPY --from=build /apps/api .
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS studio
WORKDIR /usr/app/
COPY --from=build /apps/studio .
EXPOSE 5555
CMD [ "pnpm", "start"]