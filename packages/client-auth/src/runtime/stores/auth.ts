import { navigateTo } from "nuxt/app"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

import type { AuthUser } from "@webapp/orm"

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

const useCsrfStore = defineStore("csrf", () => {
  // Csrf token state
  const token = ref<string | null>(null)

  // Set csrf token state
  const setCsrfToken = (value?: string | null) => {
    token.value = value ?? null
  }

  return { token, setCsrfToken }
})

export const useAuthStore = defineStore("auth", () => {
  // Get module options
  const options = useAuthOptions()

  // Get auth user store
  const authUserStore = useAuthUserStore()

  // Get csrf store
  const csrfStore = useCsrfStore()

  // Login using email and password
  const login = async (data: { email: string; password: string }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    const csrfToken = await useAuthFetch<string>(options.routes.login, {
      body: data,
    })
    // Set csrf token
    csrfStore.setCsrfToken(csrfToken)
    // Fetch user
    await fetchUser()
  }

  // Invalidate the current session
  const invalidateSession = async () => {
    // Invalidate session if there is a user
    if (authUserStore.user) {
      await useAuthFetch(options.routes.logout)
      authUserStore.setAuthUser(null)
      csrfStore.setCsrfToken(null)
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
      csrfStore.setCsrfToken(null)
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
    const user = await useAuthFetch<AuthUser | null>(options.routes.fetchUser)
    authUserStore.setAuthUser(user)
    return user
  }

  // Create a new user account
  const signup = async (data: {
    givenName: string
    familyName?: string
    email: string
    password: string
  }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    const csrfToken = await useAuthFetch<string>(options.routes.signup, {
      body: data,
    })
    // Set csrf token
    csrfStore.setCsrfToken(csrfToken)
    // Fetch user
    await fetchUser()
  }

  const forgotPassword = async (data: { email: string }) => {
    // Send request
    const resetPasswordToken = await useAuthFetch<string>(
      options.routes.forgotPassword,
      {
        body: data,
      },
    )
    return resetPasswordToken
  }

  const confirmOTPCode = async (data: { otpCode: string; token: string }) => {
    // Send request
    const otpToken = await useAuthFetch<string>(options.routes.confirmOTPCode, {
      body: data,
    })
    return otpToken
  }

  const resetUserPassword = async (data: {
    newPassword: string
    confirmPassword: string
    token: string
    otpToken: string
  }) => {
    // Invalidate existing session
    await invalidateSession()
    // Send request
    const csrfToken = await useAuthFetch<string>(options.routes.resetPassword, {
      body: data,
    })
    // Set csrf token
    csrfStore.setCsrfToken(csrfToken)
    // Fetch user
    await fetchUser()
  }

  return {
    user: computed(() => authUserStore.user),
    csrfToken: computed(() => csrfStore.token),
    setCsrfToken: csrfStore.setCsrfToken,
    login,
    invalidateSession,
    logout,
    invalidateAllSessions,
    logoutAll,
    fetchUser,
    signup,
    forgotPassword,
    confirmOTPCode,
    resetUserPassword,
  }
})

export default useAuthStore
