import type { NitroFetchOptions } from "nitropack"
import { useNuxtApp } from "nuxt/app"

import authFetch from "./authFetch"

export default async function useAuthFetch<T>(
  request: string,
  opts: NitroFetchOptions<string> = {},
) {
  // Get nuxt instance
  const nuxtApp = useNuxtApp()
  // Fetch
  const res = await nuxtApp.runWithContext(() => authFetch<T>(request, opts))
  // Return result data
  return res._data
}
