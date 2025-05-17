// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  workspaceDir: "../../",
  srcDir: "src/",
  modules: ["@nuxt/ui", "@nuxt/image", "@webapp/client-auth"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    domainApp: process.env.NUXT_DOMAIN_APP || "",
  },
  auth: {
    apiUrl: `https://api.${process.env.NUXT_DOMAIN_APP}`,
    serverApiUrl: `http://api.${process.env.NUXT_DOMAIN_APP}:3000`,
  },
})
