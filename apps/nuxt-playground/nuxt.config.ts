export default defineNuxtConfig({
  compatibilityDate: "2026-09-01",
  devtools: { enabled: false },
  modules: ["nuxt-driver-vue"],
  app: {
    head: {
      title: "driver-vue playground",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  css: ["~/assets/playground.css", "~/assets/fx.css"],
  driver: {
    defaults: {
      animate: true,
      showProgress: true,
    },
  },
});
