import { defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import { useAuthStore } from "../stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Get module options
  const options = useAuthOptions()
  // Skip middleware if navigating to the redirect route or ignored route
  if (
    to.path === options.redirectRoute ||
    options.ignoreRoutes.includes(to.path)
  ) {
    return
  }
  // Check for toke in session cookie
  const token = useCookie(options.cookieName)
  if (!token.value) {
    // If no session token found, redirect the user
    return navigateTo(options.redirectRoute)
  }
  // Check if there is an authenticated user
  const auth = useAuthStore()
  if (!auth.user) {
    // Try to fetch the logged in user from the server
    await auth.fetchUser()
    // If user is still not found, invalidate the session and redirect the user
    if (!auth.user) {
      await auth.logout()
      return navigateTo(options.redirectRoute)
    }
  }
})
