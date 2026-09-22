<p align="center">
  <img src="./logo.svg" width="120" alt="driver-vue" />
</p>

<h1 align="center">driver-vue</h1>

<p align="center">
  Product tours, highlights and hints for Vue 3 and Nuxt 4, rendered with your own components.<br />
  A port of <a href="https://github.com/nilbuild/driver.js">driver.js</a>: same API, same class names, your markup.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/driver-vue"><img src="https://img.shields.io/npm/v/driver-vue?color=3866e8&label=driver-vue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/nuxt-driver-vue"><img src="https://img.shields.io/npm/v/nuxt-driver-vue?color=3866e8&label=nuxt-driver-vue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/driver-vue"><img src="https://img.shields.io/npm/dm/driver-vue?color=3866e8" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/driver-vue"><img src="https://img.shields.io/bundlephobia/minzip/driver-vue?color=3866e8&label=minzip" alt="bundle size" /></a>
  <a href="https://github.com/Eg0r0k/driver-vue/actions/workflows/ci.yml"><img src="https://github.com/Eg0r0k/driver-vue/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-3866e8" alt="MIT" /></a>
</p>

## Install

```sh
pnpm add driver-vue          # Vue 3
pnpm add nuxt-driver-vue     # Nuxt 4 module (installs driver-vue)
```

## Use

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";
import "driver-vue/style.css";

const { drive } = useDriver({
  showProgress: true,
  steps: [
    { element: "#hero", popover: { title: "Welcome", description: "This is the hero." } },
    { element: "#cta", popover: { title: "Call to action", side: "left" } },
  ],
});
</script>

<template>
  <button @click="drive()">Start tour</button>
  <DriverTour />
</template>
```

Render the popover yourself:

```vue
<DriverTour>
  <template #popover="{ popover, index, total, isLast, next, prev }">
    <MyCard :title="popover.title" :progress="(index + 1) / total">
      <MyButton @click="prev">Back</MyButton>
      <MyButton @click="next">{{ isLast ? "Finish" : "Next" }}</MyButton>
    </MyCard>
  </template>
</DriverTour>
```

Nuxt:

```ts
export default defineNuxtConfig({ modules: ["nuxt-driver-vue"] });
```

## What you get

- The driver.js configuration, steps, hooks and `Driver` methods, unchanged.
- Slots for every part of the popover, a component per step, or a fully headless tour from the reactive state.
- The highlight box you can animate: `easing`, `stageClass`, CSS-driven movement with `DriverBoxOverlay`.
- Hints (beacons), Floating UI positioning, SSR-safe components, a Nuxt module with auto-imports.

## Packages

| Package | Path |
| --- | --- |
| [`driver-vue`](./packages/vue) | the library |
| [`nuxt-driver-vue`](./packages/nuxt) | the Nuxt module |
| docs | `apps/docs` (VitePress, `pnpm docs:dev`) |
| playground | `apps/nuxt-playground` (`pnpm play:nuxt`) |

## Contributing

Documentation with live demos: [eg0r0k.github.io/driver-vue](https://eg0r0k.github.io/driver-vue/).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow, commit format and releases.

## License

[MIT](./LICENSE). driver.js is © Kamran Ahmed, MIT.
