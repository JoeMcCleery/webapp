# syntax=docker/dockerfile:1.7-labs

FROM node:lts-slim AS base
RUN apt-get update -y && apt-get install -y openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS setup
WORKDIR /usr/src/app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY --parents ./packages/*/package.json .

FROM setup AS build
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS common
WORKDIR /usr/app
COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/node_modules ./node_modules

FROM common AS api
WORKDIR /usr/app
COPY --from=build /usr/src/app/packages/api ./packages/api
COPY --from=build /usr/src/app/packages/database ./packages/database
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM common AS prisma-studio
WORKDIR /usr/app/
COPY --from=build /usr/src/app/packages/database ./packages/database
EXPOSE 5555
CMD [ "pnpm", "prisma:studio"]