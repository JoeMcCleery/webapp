import { createTRPCClient, httpBatchLink } from "@trpc/client"
import type { NitroFetchOptions } from "nitropack"
import { defineNuxtPlugin } from "nuxt/app"

import type { AppRouter } from "@webapp/orm"

import authFetch from "../composables/authFetch"

export default defineNuxtPlugin({
  name: "trpc",
  async setup(nuxtApp) {
    const trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "",
          fetch(url, options) {
            return nuxtApp.runWithContext(() =>
              authFetch(`/trpc${url}`, {
                ...options,
                method: options?.method as NitroFetchOptions<string>["method"],
                ignoreResponseError: true,
              }),
            )
          },
        }),
      ],
    })

    return {
      provide: {
        trpc,
      },
    }
  },
})
