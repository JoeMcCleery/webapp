import { navigateTo } from "nuxt/app"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

import type { AuthUser } from "../../module"
import useAuthFetch from "../composables/useAuthFetch"
import useAuthOptions from "../composables/useAuthOptions"

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
    await useAuthFetch(options.routes.login, { body: data })
    // Fetch user
    await fetchUser()
  }

  // Invalidate the current session
  const invalidateSession = async () => {
    // Invalidate session if there is a user
    if (authUserStore.user) {
      await useAuthFetch(options.routes.logout)
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
      await useAuthFetch(options.routes.logoutAll)
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
    const result = await useAuthFetch<AuthUser | null>(options.routes.fetchUser)
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
    await useAuthFetch(options.routes.signup, { body: data })
    // Fetch user
    await fetchUser()
  }

  const forgotPassword = async (data: { email: string }) => {
    // Send request
    const result = await useAuthFetch(options.routes.forgotPassword, {
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
    await useAuthFetch(options.routes.resetPassword, { body: data })
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
