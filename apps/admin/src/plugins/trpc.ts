import type { NuxtApp } from "#app"
import { createTRPCClient, httpBatchLink } from "@trpc/client"

import type { AppRouter } from "@webapp/orm"

export default defineNuxtPlugin({
  name: "trpc",
  async setup(nuxtApp: NuxtApp) {
    const trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "",
          fetch(url, options) {
            return nuxtApp.runWithContext(() =>
              authFetch(url, options, "/trpc"),
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
