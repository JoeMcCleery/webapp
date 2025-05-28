import { useNuxtApp } from "nuxt/app"

import { AuthFetchError } from "../../error"
import authFetch from "../utils/authFetch"

export default async function useAuthFetch<T>(
  request: string,
  opts: RequestInit = {},
) {
  // Get nuxt instance
  const nuxtApp = useNuxtApp()
  // Deduplicate api requests on the client during hydration
  if (import.meta.client && nuxtApp.isHydrating && request in nuxtApp.payload) {
    // Return cached result during hydration
    return nuxtApp.payload[request] as T
  }
  // Fetch
  const res = await nuxtApp.runWithContext(() => authFetch(request, opts))
  // Throw error if failed
  if (!res.ok) {
    const json = await res.json()
    throw new AuthFetchError({
      statusCode: json.statusCode,
      error: json.error,
      message: json.message || "Something went wrong",
    })
  }
  // Parse response
  const contentType = res.headers.get("content-type")
  let data: T
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json = await res.json()
    data = json as T
  } else {
    const text = await res.text()
    data = text as T
  }
  // Attach result to nuxt payload to prevent duplicate requests
  if (import.meta.server) {
    nuxtApp.payload[request] = data
  }
  // Return result data
  return data
}
