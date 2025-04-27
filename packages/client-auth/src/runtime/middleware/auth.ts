import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import { useAuthStore } from "../stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Get module options
  const options = useAuthOptions()
  // Skip middleware if navigating to the redirect route or ignored route and authentication is required
  if (
    options.authenticationRequired &&
    (to.path === options.redirectRoute ||
      options.ignoredRoutes.includes(to.path))
  ) {
    return
  }
  // Get auth store
  const auth = useAuthStore()
  // Check for session cookie
  if (!auth.sessionCookie) {
    // If no session cookie, invalidate session and optionally redirect the user
    await auth.invalidateSession()
    if (options.authenticationRequired) {
      return navigateTo(options.redirectRoute)
    } else {
      return
    }
  }
  // Check for user
  if (!auth.user) {
    // Try to fetch the user from the server
    await auth.fetchUser()
    // If user is still not found, invalidate session and optionally redirect the user
    if (!auth.user) {
      await auth.invalidateSession()
      if (options.authenticationRequired) {
        return navigateTo(options.redirectRoute)
      } else {
        return
      }
    }
  }
})
