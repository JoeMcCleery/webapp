import {
  addImportsDir,
  addRouteMiddleware,
  createResolver,
  defineNuxtModule,
  installModule,
} from "@nuxt/kit"
import { defu } from "defu"

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    auth: ModuleOptions
  }
}

export interface ModuleOptions {
  cookieName: string
  globalMiddleware: boolean
  redirectRoute: string
  ignoredRoutes: string[]
  apiUrl: string
  serverApiUrl: string
  authenticationRequired: boolean
  routes: {
    login: string
    logout: string
    logoutAll: string
    fetchUser: string
    signup: string
    forgotPassword: string
    resetPassword: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@webapp/client-auth",
    configKey: "auth",
  },
  defaults: {
    cookieName: "session-token",
    globalMiddleware: true,
    redirectRoute: "/login",
    ignoredRoutes: ["/signup", "/forgot-password", "/reset-password"],
    apiUrl: "",
    serverApiUrl: "",
    authenticationRequired: true,
    routes: {
      login: "/auth/login",
      logout: "/auth/logout",
      logoutAll: "/auth/logout-all",
      fetchUser: "/auth/user",
      signup: "/auth/signup",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/auth/reset-password",
    },
  },
  async setup(inlineOptions, nuxt) {
    // Expose inline options to nuxt runtime config (values set in runtime config have priority)
    const moduleOptions = defu(nuxt.options.runtimeConfig.public.auth || {}, {
      ...inlineOptions,
    })
    nuxt.options.runtimeConfig.public.auth = moduleOptions

    // Install pinia module
    await installModule("@pinia/nuxt")

    const resolver = createResolver(import.meta.url)

    // Auto import module composables
    addImportsDir(resolver.resolve("./runtime/composables"))

    // Auto import module stores
    addImportsDir(resolver.resolve("./runtime/stores"))

    // Add auth middleware
    addRouteMiddleware(
      {
        name: "auth",
        path: resolver.resolve("./runtime/middleware/auth"),
        global: moduleOptions.globalMiddleware,
      },
      { prepend: true },
    )
  },
})
