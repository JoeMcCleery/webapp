import defu from "defu"
import { appendResponseHeader } from "h3"
import type { NitroFetchOptions } from "nitropack"
import { useNuxtApp, useRequestEvent, useRequestHeaders } from "nuxt/app"

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
  // Get cookies from client
  const headers = useRequestHeaders(["cookie"])
  // Create fetch options object
  const fetchOptions = defu(opts || {}, {
    method: "POST",
    headers,
    credentials: "include",
    baseURL: import.meta.server ? options.serverApiUrl : options.apiUrl,
  } as NitroFetchOptions<typeof request>)
  // Get current request event (only exists in server context)
  const event = useRequestEvent()
  // Fetch on server or client
  if (event) {
    // Send raw request to api
    const res = await $fetch.raw<T>(request, fetchOptions)
    // Get cookies from api response
    const cookies = res.headers.getSetCookie()
    // Attach cookies to incoming request
    for (const cookie of cookies) {
      appendResponseHeader(event, "set-cookie", cookie)
    }
    // Attach result to nuxt payload
    nuxtApp.payload[request] = res._data
    // Return the data of the request
    return res._data
  } else {
    // Send request to api and return result
    return await $fetch<T>(request, fetchOptions)
  }
}
