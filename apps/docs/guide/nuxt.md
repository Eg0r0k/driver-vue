# Nuxt

`nuxt-driver-vue` is a Nuxt 4 module for driver-vue. It installs `DriverPlugin`, auto-imports the composables, registers the components and adds the stylesheet.

```bash
pnpm add driver-vue nuxt-driver-vue
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-driver-vue"],

  driver: {
    // Config merged under every useDriver() call, as the DriverPlugin
    // `defaults`. It goes through runtime config, so only serializable values
    // work; pass hooks and components in your code instead.
    defaults: { showProgress: true },
    // Register the components globally. (default: true)
    components: true,
    // Prefix of the component names. (default: "Driver")
    prefix: "Driver",
    // Add driver-vue/style.css to the app. Set to false to use your own
    // stylesheet. (default: true)
    css: true,
  },
});
```

`runtimeConfig.public.driver.defaults` is merged over `driver.defaults`, so the defaults can also be set per environment.

The registered components are `DriverTour`, `DriverPopover`, `DriverOverlay`, `DriverBoxOverlay`, `DriverStage`, `DriverHints` and `DriverHintBeacon`. The auto-imports are `useDriver`, `createDriver`, `driver`, `useDriverPosition`, `provideDriver` and `injectDriver` from `driver-vue`, and `useHints`, `createHints` and `hints` from `driver-vue/hints`.

## A tour in a page

As in a Vue app, a `<DriverTour />` in the same component renders the driver from `useDriver()`:

```vue
<script setup lang="ts">
const { drive } = useDriver({
  steps: [
    { element: "#welcome", popover: { title: "Welcome", description: "This is your dashboard." } },
    { element: "#reports", popover: { title: "Reports", description: "All reports are listed here." } },
  ],
});

onMounted(() => {
  if (!localStorage.getItem("onboarded")) {
    drive();
  }
});
</script>

<template>
  <!-- ... -->
  <DriverTour />
</template>
```

Call `drive()` from event handlers or `onMounted`. On the server the driver does nothing and `drive()` returns without effect, so a call during setup starts nothing.

## One `<DriverTour />` for the app

A `<DriverTour />` in `app.vue` or a layout renders the app-wide driver. Pages use it through `useDriver(config, { shared: true })`, and a tour on it keeps running across navigation (see [Multi-page tour](../examples/multi-page-tour)).

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DriverTour />
</template>
```

```ts
// in a page
const { drive } = useDriver({ steps: [/* ... */] }, { shared: true });
```

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

## SSR

- `<DriverTour>` and `<DriverHints>` render only after mount and teleport to `body`, so there is no hydration mismatch.
- `createDriver()` outside a component also works on the server, where it returns an instance that does nothing.
- Elements are looked up when a step is shown. For content that renders after a route change, use `waitForElement` (see [Interactive tour](../examples/interactive-tour)).

## Without the module

Add a plugin that installs `DriverPlugin` and import the stylesheet:

```ts
// plugins/driver.ts
import { DriverPlugin } from "driver-vue";
import "driver-vue/style.css";

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(DriverPlugin, { components: true });
});
```

Leave out the `.client` suffix so the plugin also runs on the server. Otherwise a `<DriverTour />` without a `driver` prop finds no driver during server rendering and logs a warning in development. Without the module the composables are not auto-imported; import them from `driver-vue`.
