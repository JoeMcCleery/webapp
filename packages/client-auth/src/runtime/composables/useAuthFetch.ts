import type { NitroFetchRequest } from "nitropack"
import { useFetch, useNuxtApp } from "nuxt/app"
import type { UseFetchOptions } from "nuxt/app"

export default function useAuthFetch<T>(
  request: NitroFetchRequest,
  opts?: UseFetchOptions<T>,
) {
  return useFetch(request, {
    ...opts,
    $fetch: (useNuxtApp().$authFetch as () => typeof $fetch)(),
  })
}
