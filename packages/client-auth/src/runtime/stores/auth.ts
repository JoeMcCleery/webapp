import { navigateTo, refreshCookie, useCookie, useRequestFetch } from "nuxt/app"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

import type { User } from "@webapp/orm"

import useAuthOptions from "../composables/useAuthOptions"

type AuthUser = Omit<User, "password">

const getBaseAPIUrl = () => {
  const options = useAuthOptions()
  if (import.meta.server) {
    return options.serverApiUrl
  }
  return options.apiUrl
}

const useAuthUserStore = defineStore("auth-user", () => {
  // Authenticated user state
  const user = ref<Readonly<AuthUser> | null>(null)

  // Set authenticated user state
  const setAuthUser = (value: Readonly<AuthUser> | null) => {
    user.value = value
  }

  return { user, setAuthUser }
})

export const useAuthStore = defineStore("auth", () => {
  // Get module options
  const options = useAuthOptions()

  // Get auth user store
  const authUserStore = useAuthUserStore()

  // Get readonly session cookie
  const sessionCookie = useCookie(options.cookieName, { readonly: true })

  // Refresh the session cookie ref
  const refreshSessionCookie = () => refreshCookie(options.cookieName)

  // Login using email and password
  const login = async (data: { email: string; password: string }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    const requestFetch = useRequestFetch()
    await requestFetch(options.routes.login, {
      method: "POST",
      baseURL: getBaseAPIUrl(),
      body: data,
      credentials: "include",
    })
    refreshSessionCookie()
    // Fetch user
    await fetchUser()
  }

  // Invalidate the current session
  const invalidateSession = async () => {
    authUserStore.setAuthUser(null)
    // Invalidate session if there is a session cookie
    if (sessionCookie.value) {
      const requestFetch = useRequestFetch()
      await requestFetch(options.routes.logout, {
        method: "POST",
        baseURL: getBaseAPIUrl(),
        credentials: "include",
      })
    }
    refreshSessionCookie()
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
    authUserStore.setAuthUser(null)
    // Invalidate all sessions if there is a session cookie
    if (sessionCookie.value) {
      const requestFetch = useRequestFetch()
      const result = await requestFetch(options.routes.logoutAll, {
        method: "POST",
        baseURL: getBaseAPIUrl(),
        credentials: "include",
      })
    }
    refreshSessionCookie()
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
    let result: AuthUser | null = null
    // Only send the request if there is a session cookie
    if (sessionCookie.value) {
      const requestFetch = useRequestFetch()
      result = await requestFetch<AuthUser | null>(options.routes.fetchUser, {
        method: "POST",
        baseURL: getBaseAPIUrl(),
        credentials: "include",
      })
    }
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
    const requestFetch = useRequestFetch()
    await requestFetch(options.routes.signup, {
      method: "POST",
      baseURL: getBaseAPIUrl(),
      credentials: "include",
      body: data,
    })
    refreshSessionCookie()
    // Fetch user
    await fetchUser()
  }

  const forgotPassword = async (data: { email: string }) => {
    // Send request
    const requestFetch = useRequestFetch()
    const result = await requestFetch(options.routes.forgotPassword, {
      method: "POST",
      baseURL: getBaseAPIUrl(),
      credentials: "include",
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
    const requestFetch = useRequestFetch()
    await requestFetch(options.routes.resetPassword, {
      method: "POST",
      baseURL: getBaseAPIUrl(),
      credentials: "include",
      body: data,
    })
    refreshSessionCookie()
    // Fetch user
    await fetchUser()
  }

  return {
    user: computed(() => authUserStore.user),
    sessionCookie,
    refreshSessionCookie,
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
