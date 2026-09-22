import { DriverPlugin } from "driver-vue";
import type { Config } from "driver-vue";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin({
  name: "nuxt-driver-vue",
  setup: nuxtApp => {
    const runtime = useRuntimeConfig().public.driver as { defaults?: Config } | undefined;

    nuxtApp.vueApp.use(DriverPlugin, { defaults: runtime?.defaults ?? {} });
  },
});
