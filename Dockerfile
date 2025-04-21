# syntax=docker/dockerfile:1.7-labs

FROM node:22.14.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./.npmrc ./
COPY --parents ./apps/*/package.json .
COPY --parents ./packages/*/package.json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run --filter=@web-app/orm db:generate
# Deploy packages
RUN pnpm deploy --filter=@web-app/orm --legacy /packages/orm
# Deploy apps
RUN pnpm deploy --filter=@web-app/api --legacy /apps/api
RUN pnpm deploy --filter=@web-app/cms --legacy /apps/cms

FROM base AS orm
WORKDIR /usr/package
COPY --from=build /packages/orm .
EXPOSE 3000
CMD [ "pnpm", "db:studio" ]

FROM base AS api
WORKDIR /usr/app
COPY --from=build /apps/api .
EXPOSE 3000
CMD [ "pnpm", "dev" ]

FROM base AS cms
WORKDIR /usr/app
COPY --from=build /apps/cms .
EXPOSE 3000
CMD [ "pnpm", "dev" ]