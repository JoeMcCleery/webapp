import type { ResponseEsque } from "@trpc/client/dist/internals/types"
import defu from "defu"
import { appendResponseHeader } from "h3"
import type { NitroFetchOptions } from "nitropack"
import { useNuxtApp, useRequestEvent, useRequestHeaders } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import { useAuthStore } from "../stores/auth"

export default async function authFetch<T>(
  request: URL | RequestInfo,
  opts: NitroFetchOptions<string> = {},
): Promise<
  ResponseEsque & { json: () => Promise<T>; _data?: T } & Record<
      string,
      unknown
    >
> {
  // Only string request is used
  request = request.toString()
  // Get nuxt instance
  const nuxtApp = useNuxtApp()
  // Deduplicate api requests on the client during hydration
  if (import.meta.client && nuxtApp.isHydrating && request in nuxtApp.payload) {
    // Return cached result during hydration
    const _data = nuxtApp.payload[request] as T
    return {
      _data,
      json: () => Promise.resolve(_data),
    }
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
    baseURL: import.meta.server ? options.serverApiUrl : options.apiUrl,
    method: "POST",
    headers: { cookie, [options.csrfHeaderName]: authStore.csrfToken },
    credentials: "include",
  } as NitroFetchOptions<string>)
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
    if (import.meta.server) {
      nuxtApp.payload[request] = res._data
    }
  }
  // Return the data of the request
  return {
    ...res,
    headers: res.headers,
    json: () => Promise.resolve(res._data as T),
  }
}
