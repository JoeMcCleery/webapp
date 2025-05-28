import defu from "defu"
import { appendResponseHeader } from "h3"
import { useRequestEvent, useRequestHeaders } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import { useAuthStore } from "../stores/auth"

export default async function authFetch(
  request: string | URL | globalThis.Request,
  opts: RequestInit = {},
  routePrefix: string = "",
) {
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
  } as RequestInit)
  // Get current request event (only available on server)
  const event = useRequestEvent()
  // Send raw request to api
  const url = `${import.meta.server ? options.serverApiUrl : options.apiUrl}${routePrefix}${request}`
  const res = await fetch(url, fetchOptions)
  if (import.meta.server && event) {
    // Get cookies from api response
    const cookies = res.headers.getSetCookie()
    // Proxy response cookies to client
    for (const c of cookies) {
      appendResponseHeader(event, "set-cookie", c)
    }
  }
  // Return the data of the request
  return res
}
