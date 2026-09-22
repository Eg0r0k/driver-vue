import { DriverPlugin } from "driver-vue";
import type { Config } from "driver-vue";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

// Installs driver-vue into the Vue app on both server and client. The driver
// itself is inert without a window, and <DriverTour /> renders nothing until
// it is mounted, so SSR output never contains tour markup.
export default defineNuxtPlugin({
  name: "nuxt-driver-vue",
  setup: nuxtApp => {
    const runtime = useRuntimeConfig().public.driver as { defaults?: Config } | undefined;

    nuxtApp.vueApp.use(DriverPlugin, { defaults: runtime?.defaults ?? {} });
  },
});
