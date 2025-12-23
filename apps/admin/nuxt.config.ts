// https://nuxt.com/docs/api/configuration/nuxt-config

const apiDomain = `api.${process.env.NUXT_DOMAIN_APP || "api.app.localhost"}`

export default defineNuxtConfig({
  workspaceDir: "../../",
  srcDir: "src/app/",
  serverDir: "src/server/",
  dir: {
    modules: "src/modules",
    public: "src/public",
  },
  vite: {
    server: {
      allowedHosts: [`.${process.env.NUXT_DOMAIN_APP}`],
    },
  },
  modules: ["@nuxt/ui", "@nuxt/image", "@webapp/client-auth"],
  css: ["~/assets/css/main.css"],
  auth: {
    apiUrl: `https://${apiDomain}`,
    serverApiUrl: `http://${apiDomain}:3000`,
  },
})
