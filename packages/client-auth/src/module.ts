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
  api: {
    serverUrl: string
    clientUrl: string
    routes: {
      login: string
      logout: string
      logoutAll: string
      fetchUser: string
      signup: string
      reset: string
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@web-app/client-auth",
    configKey: "auth",
  },
  defaults: {
    cookieName: "session-token",
    globalMiddleware: true,
    redirectRoute: "/login",
    ignoredRoutes: ["/signup", "/forgot-password", "/reset-password"],
    api: {
      serverUrl: "http://api:3000",
      clientUrl: "https://api.localhost",
      routes: {
        login: "/auth/login",
        logout: "/auth/logout",
        logoutAll: "/auth/logout-all",
        fetchUser: "/auth/user",
        signup: "/auth/signup",
        reset: "/auth/reset",
      },
    },
  },
  async setup(inlineOptions, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Expose options to the runtime config
    const moduleOptions = defu(nuxt.options.runtimeConfig.public.auth || {}, {
      ...inlineOptions,
    })
    nuxt.options.runtimeConfig.public.auth = moduleOptions

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

    // Install pinia module
    await installModule("@pinia/nuxt")
  },
})
