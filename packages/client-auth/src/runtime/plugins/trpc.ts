import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { defineNuxtPlugin } from "nuxt/app"

import type { AppRouter } from "@webapp/orm"

export default defineNuxtPlugin({
  name: "trpc",
  async setup(nuxtApp) {
    const trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/trpc",
          async fetch(request, options) {
            const authFetch = await nuxtApp.runWithContext(
              nuxtApp.$authFetch as () => typeof $fetch,
            )
            return authFetch
              .raw(request.toString(), {
                ...options,
              })
              .then((res) => ({
                ...res,
                headers: res.headers,
                json: () => Promise.resolve(res._data),
              }))
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
