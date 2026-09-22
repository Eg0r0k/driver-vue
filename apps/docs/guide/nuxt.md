# Nuxt

`nuxt-driver-vue` wraps driver-vue for Nuxt 4: it installs the plugin on the client, auto-imports the composables, registers the components and adds the stylesheet.

```bash
pnpm add driver-vue nuxt-driver-vue
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-driver-vue"],

  driver: {
    // Config merged under every useDriver() call (same as DriverPlugin defaults).
    defaults: { showProgress: true },
    // Register DriverTour, DriverPopover, DriverOverlay, DriverStage and
    // DriverHints as global components. (default: true)
    components: true,
    // Component name prefix. (default: "Driver")
    prefix: "Driver",
    // Add driver-vue/style.css to nuxt.options.css. Set to false to ship your
    // own stylesheet. (default: true)
    css: true,
  },
});
```

`runtimeConfig.public.driver` is merged over `driver.defaults`, so defaults can also come from the environment.

## Rendering the tour

Put `<DriverTour />` once in `app.vue` or in a layout. It renders nothing on the server and nothing on the client until a tour is active, so it is safe anywhere.

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DriverTour />
</template>
```

## Using a tour in a page

`useDriver`, `useHints`, `createDriver` and `createHints` are auto-imported.

```vue
<script setup lang="ts">
const { drive } = useDriver({
  steps: [
    { element: "#welcome", popover: { title: "Welcome", description: "This is your dashboard." } },
    { element: "#reports", popover: { title: "Reports", description: "Every report lives here." } },
  ],
});

onMounted(() => {
  if (!localStorage.getItem("onboarded")) {
    drive();
  }
});
</script>
```

Call `drive()` from event handlers or `onMounted`; on the server the driver is inert and `drive()` is a no-op, so calling it during setup does nothing harmful but also nothing useful.

## Hints

```vue
<script setup lang="ts">
const { hints, show } = useHints({
  hints: [{ element: "#export", popover: { title: "Export", description: "CSV or PDF." } }],
});

onMounted(show);
</script>

<template>
  <DriverHints :hints="hints" />
</template>
```

## SSR notes

- Components use `<Teleport>` to `body` and only render after mount; there is no hydration mismatch.
- `createDriver()` outside a component works on the server too and returns an inert instance.
- Elements are resolved when a step is driven, so route changes are fine: use `waitForElement` for content that renders after navigation (see [Multi-Page Tour](../examples/multi-page-tour)).

## Without the module

The module is thin. Without it, add a client plugin:

```ts
// plugins/driver.client.ts
import { DriverPlugin } from "driver-vue";
import "driver-vue/style.css";

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(DriverPlugin, { components: true });
});
```
