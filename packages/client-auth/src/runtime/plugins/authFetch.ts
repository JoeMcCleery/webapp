import { appendResponseHeader } from "h3"
import { defineNuxtPlugin, useRequestEvent, useRequestHeaders } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import useAuthStore from "../stores/auth"

export default defineNuxtPlugin({
  name: "authFetch",
  async setup(nuxtApp) {
    const authOptions = useAuthOptions()
    const authStore = useAuthStore()

    const authFetch = $fetch.create({
      credentials: "include",

      onRequest({ request, options, error }) {
        // Set base URL depending on context
        options.baseURL = import.meta.server
          ? authOptions.serverApiUrl
          : authOptions.apiUrl
        // Get cookies from client request
        const { cookie } = useRequestHeaders(["cookie"])
        // Set csrf token from request cookies
        if (import.meta.server && !authStore.csrfToken) {
          const csrfToken = cookie
            ?.split("; ")
            .find((c) => c.startsWith(authOptions.csrfCookieName))
            ?.split("=")[1]
          authStore.setCsrfToken(csrfToken)
        }
        // Proxy cookies and csrf token to api request
        if (import.meta.server && cookie) {
          options.headers.set("cookie", cookie)
        }
        if (authStore.csrfToken) {
          options.headers.set(authOptions.csrfHeaderName, authStore.csrfToken)
        }
      },

      onResponse({ request, response, options, error }) {
        // Proxy response cookies to client
        if (import.meta.server) {
          const cookies = response.headers.getSetCookie()
          for (const c of cookies) {
            response.headers.append("set-cookie", c)
          }
        }
      },
    })

    return {
      provide: {
        authFetch,
      },
    }
  },
})
