import defu from "defu"
import { appendResponseHeader } from "h3"
import type { NitroFetchOptions } from "nitropack"
import { useNuxtApp, useRequestEvent, useRequestHeaders } from "nuxt/app"

import { useAuthStore } from "../stores/auth"
import useAuthOptions from "./useAuthOptions"

export default async function useAuthFetch<T>(
  request: string,
  opts: NitroFetchOptions<typeof request> = {},
) {
  // Get nuxt instance
  const nuxtApp = useNuxtApp()
  // Deduplicate api requests on the client during hydration
  if (import.meta.client && nuxtApp.isHydrating && request in nuxtApp.payload) {
    // Return cached result during hydration
    return nuxtApp.payload[request] as T | undefined
  }
  // Get module options
  const options = useAuthOptions()
  // Get auth store
  const authStore = useAuthStore()
  // Get cookies from client
  const { cookie } = useRequestHeaders(["cookie"])
  // Get csrf token from cookies on server
  if (import.meta.server && !authStore.csrfToken) {
    const csrfToken = cookie
      ?.split("; ")
      .find((c) => c.startsWith(options.csrfCookieName))
      ?.split("=")[1]
    authStore.setCsrfToken(csrfToken)
  }
  // Create fetch options object
  const fetchOptions = defu(opts || {}, {
    method: "POST",
    headers: { cookie, [options.csrfHeaderName]: authStore.csrfToken },
    credentials: "include",
    baseURL: import.meta.server ? options.serverApiUrl : options.apiUrl,
  } as NitroFetchOptions<typeof request>)
  // Get current request event (only available on server)
  const event = useRequestEvent()
  // Send raw request to api
  const res = await $fetch.raw<T>(request, fetchOptions)
  if (import.meta.server && event) {
    // Get cookies from api response
    const cookies = res.headers.getSetCookie()
    // Proxy response cookies to client
    for (const c of cookies) {
      appendResponseHeader(event, "set-cookie", c)
    }
    // Attach result to nuxt payload to prevent duplicate requests
    nuxtApp.payload[request] = res._data
  }
  // Return the data of the request
  return res._data
}
