import { useFetch, useState } from "nuxt/app"
import { defineStore } from "pinia"
import { computed } from "vue"

import type { User } from "@web-app/db"

import useAuthOptions from "../composables/useAuthOptions"

const apiUrl = (path: string) => {
  // Get module options
  const options = useAuthOptions()

  // Use server or client URL based on the environment
  if (import.meta.server) {
    return `${options.api.serverUrl}${path}`
  }
  return `${options.api.clientUrl}${path}`
}

export const useAuthStore = defineStore("auth", () => {
  // Get module options
  const options = useAuthOptions()

  // Define the state for the authenticated user
  const authUser = useState<User | null>("auth-user", () => null)
  const user = computed(() => authUser.value)

  // Login using email and password
  const login = async (data: { email: string; password: string }) => {
    const result = await useFetch<User>(apiUrl(options.api.routes.login), {
      method: "POST",
      body: data,
    })
    if (result.data.value) {
      authUser.value = result.data.value
    }
  }

  // Invalidate the current session
  const logout = async () => {
    authUser.value = null
    const result = await useFetch<User>(apiUrl(options.api.routes.logout), {
      method: "POST",
    })
  }

  // Invalidate all sessions for the user
  const logoutAll = async () => {
    authUser.value = null
    const result = await useFetch<User>(apiUrl(options.api.routes.logoutAll), {
      method: "POST",
    })
  }

  // Using the current session, fetch the logged in user from the server
  const fetchUser = async () => {
    const result = await useFetch<User>(apiUrl(options.api.routes.fetchUser), {
      method: "POST",
    })
    if (result.data.value) {
      authUser.value = result.data.value
    }
  }

  // Create a new user account
  const signup = async (data: {
    name: string
    email: string
    password: string
  }) => {
    const result = await useFetch<User>(apiUrl(options.api.routes.signup), {
      method: "POST",
      body: data,
    })
    if (result.data.value) {
      authUser.value = result.data.value
    }
  }

  return { user, login, logout, logoutAll, fetchUser, signup }
})

export default useAuthStore
