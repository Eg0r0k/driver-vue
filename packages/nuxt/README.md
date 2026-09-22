<p align="center">
  <img src="https://raw.githubusercontent.com/Eg0r0k/driver-vue/master/logo.svg" width="120" alt="nuxt-driver-vue" />
</p>

<h1 align="center">nuxt-driver-vue</h1>

<p align="center">
  Nuxt 4 module for <a href="https://www.npmjs.com/package/driver-vue">driver-vue</a>: product tours, highlights and hints rendered with your own components.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nuxt-driver-vue"><img src="https://img.shields.io/npm/v/nuxt-driver-vue?color=3866e8" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/nuxt-driver-vue"><img src="https://img.shields.io/npm/dm/nuxt-driver-vue?color=3866e8" alt="npm downloads" /></a>
  <a href="https://github.com/Eg0r0k/driver-vue/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-3866e8" alt="MIT" /></a>
</p>

## Install

```sh
pnpm add nuxt-driver-vue
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-driver-vue"],
  driver: {
    defaults: { showProgress: true }, // merged under every useDriver() config
    components: true, // register <DriverTour>, <DriverPopover>, <DriverHints>, ... (default)
    css: true, // add driver-vue/style.css (default)
  },
});
```

## Use

```vue
<!-- app.vue or a layout -->
<template>
  <NuxtPage />
  <DriverTour />
</template>
```

```vue
<script setup lang="ts">
const { drive } = useDriver(
  { steps: [{ element: "#hero", popover: { title: "Welcome", description: "Hello." } }] },
  { shared: true }
);
</script>
```

Auto-imports: `useDriver`, `createDriver`, `useDriverPosition`, `injectDriver`, `provideDriver`, `useHints`, `createHints`. Components render nothing on the server.

Documentation: [eg0r0k.github.io/driver-vue](https://eg0r0k.github.io/driver-vue/guide/nuxt).

## License

MIT
