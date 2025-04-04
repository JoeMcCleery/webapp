FROM node:lts-slim AS base
RUN apt-get update -y && apt-get install -y openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod-deps
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
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