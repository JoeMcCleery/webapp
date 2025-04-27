import defu from "defu"
import { appendResponseHeader } from "h3"
import type { NitroFetchOptions, NitroFetchRequest } from "nitropack"
import { navigateTo, useRequestEvent, useRequestHeaders } from "nuxt/app"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

import type { AuthUser } from "../../module"
import useAuthOptions from "../composables/useAuthOptions"

const fetchWithCookie = async <T>(
  request: NitroFetchRequest,
  opts: NitroFetchOptions<typeof request> = {},
) => {
  // Get module options
  const options = useAuthOptions()
  // Get cookies from client
  const headers = useRequestHeaders(["cookie"])
  // Create fetch options object
  const fetchOptions = defu(opts || {}, {
    method: "POST",
    headers,
    credentials: "include",
  } as NitroFetchOptions<typeof request>)
  // Get current request event (only exists in server context)
  const event = useRequestEvent()
  // Fetch on server or client
  if (event) {
    // Send raw request to api
    const res = await $fetch.raw<T>(request, {
      ...fetchOptions,
      baseURL: options.serverApiUrl,
    })
    // Get cookies from api response
    const cookies = res.headers.getSetCookie()
    // Attach cookies to incoming request
    for (const cookie of cookies) {
      appendResponseHeader(event, "set-cookie", cookie)
    }
    // Return the data of the request
    return res._data
  } else {
    // Send request to api and return result
    return await $fetch<T>(request, {
      ...fetchOptions,
      baseURL: options.apiUrl,
    })
  }
}

const useAuthUserStore = defineStore("auth-user", () => {
  // Authenticated user state
  const user = ref<Readonly<AuthUser> | null>(null)

  // Set authenticated user state
  const setAuthUser = (value?: AuthUser | null) => {
    user.value = value ?? null
  }

  return { user, setAuthUser }
})

export const useAuthStore = defineStore("auth", () => {
  // Get module options
  const options = useAuthOptions()

  // Get auth user store
  const authUserStore = useAuthUserStore()

  // Login using email and password
  const login = async (data: { email: string; password: string }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    await fetchWithCookie(options.routes.login, { body: data })
    // Fetch user
    await fetchUser()
  }

  // Invalidate the current session
  const invalidateSession = async () => {
    // Invalidate session if there is a user
    if (authUserStore.user) {
      await fetchWithCookie(options.routes.logout)
      authUserStore.setAuthUser(null)
    }
  }

  // Invalidate session and optionally redirect user
  const logout = async () => {
    await invalidateSession()
    if (options.authenticationRequired) {
      await navigateTo(options.redirectRoute)
    }
  }

  // Invalidate all sessions for the user
  const invalidateAllSessions = async () => {
    // Invalidate all sessions if there is a user
    if (authUserStore.user) {
      await fetchWithCookie(options.routes.logoutAll)
      authUserStore.setAuthUser(null)
    }
  }

  // Invalidate all sessions and optionally redirect user
  const logoutAll = async () => {
    await invalidateAllSessions()
    if (options.authenticationRequired) {
      navigateTo(options.redirectRoute)
    }
  }

  // Try fetch the logged in user from the server
  const fetchUser = async () => {
    const result = await fetchWithCookie<AuthUser | null>(
      options.routes.fetchUser,
    )
    authUserStore.setAuthUser(result)
    return result
  }

  // Create a new user account
  const signup = async (data: {
    name: string
    email: string
    password: string
  }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    await fetchWithCookie(options.routes.signup, { body: data })
    // Fetch user
    await fetchUser()
  }

  const forgotPassword = async (data: { email: string }) => {
    // Send request
    const result = await fetchWithCookie(options.routes.forgotPassword, {
      body: data,
    })
    return result
  }

  const resetUserPassword = async (data: {
    newPassword: string
    confirmPassword: string
    token: string
  }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    await fetchWithCookie(options.routes.resetPassword, { body: data })
    // Fetch user
    await fetchUser()
  }

  return {
    user: computed(() => authUserStore.user),
    login,
    invalidateSession,
    logout,
    invalidateAllSessions,
    logoutAll,
    fetchUser,
    signup,
    forgotPassword,
    resetUserPassword,
  }
})

export default useAuthStore
