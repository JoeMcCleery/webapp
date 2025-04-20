// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  workspaceDir: "../../",
  srcDir: "src/",
  modules: ["@nuxt/ui", "@nuxt/image", "@web-app/client-auth"],
  css: ["~/assets/css/main.css"],
})
