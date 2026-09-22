export default defineNuxtConfig({
  compatibilityDate: "2026-09-01",
  devtools: { enabled: false },
  modules: ["nuxt-driver-vue"],
  css: ["~/assets/playground.css", "~/assets/fx.css"],
  driver: {
    defaults: {
      animate: true,
      showProgress: true,
    },
  },
});
