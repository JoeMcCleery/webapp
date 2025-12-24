import { defineNuxtPlugin, useRequestHeaders } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import useAuthStore from "../stores/auth"

export default defineNuxtPlugin({
  name: "authFetch",
  async setup(nuxtApp) {
    const authFetch = () => {
      const authOptions = useAuthOptions()
      const authStore = useAuthStore()
      let { cookie } = useRequestHeaders(["cookie"])
      if (import.meta.server && !authStore.csrfToken) {
        const csrfToken = getCookie(cookie, authOptions.csrfCookieName)
        authStore.setCsrfToken(csrfToken)
      }
      const headers = {
        cookie,
        [authOptions.csrfHeaderName]: authStore.csrfToken || "",
      } as HeadersInit
      const baseURL = import.meta.server
        ? authOptions.serverApiUrl
        : authOptions.apiUrl

      return $fetch.create({
        credentials: "include",
        headers,
        baseURL,

        onRequest({ request, options, error }) {},

        onResponse({ request, response, options, error }) {},
      })
    }

    return {
      provide: {
        authFetch,
      },
    }
  },
})

const getCookie = (cookie: string | undefined, cookieName: string) => {
  return cookie
    ?.split("; ")
    .find((c) => c.startsWith(cookieName))
    ?.split("=")[1]
}
