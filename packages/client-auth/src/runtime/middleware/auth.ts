import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"

import useAuthOptions from "../composables/useAuthOptions"
import { useAuthStore } from "../stores/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Get auth store
  const auth = useAuthStore()
  // Check for user
  if (!auth.user) {
    // Try to fetch the user from the server
    await auth.fetchUser()
    // If user is still not found, optionally redirect the user
    if (!auth.user) {
      // Get module options
      const options = useAuthOptions()
      // Check redirect conditions
      if (
        options.authenticationRequired &&
        to.path !== options.redirectRoute &&
        !options.ignoredRoutes.includes(to.path)
      ) {
        // If authentication is required and not navigating to an ignored route, redirect user
        return navigateTo(options.redirectRoute)
      }
    }
  }
})
