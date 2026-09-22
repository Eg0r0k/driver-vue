# Installation

driver-vue is a Vue 3 (3.5+) library. For Nuxt 4 there is a module, see [Nuxt](./nuxt).

```bash
# npm
npm install driver-vue

# pnpm
pnpm add driver-vue

# yarn
yarn add driver-vue
```

The package depends on `@floating-ui/vue` for popover positioning and has `vue` as a peer dependency.

## Start using

Install the plugin once, import the stylesheet, and put one `<DriverTour />` somewhere that is always rendered (your root component or layout). It renders nothing until a tour is active.

```ts
// main.ts
import { createApp } from "vue";
import { DriverPlugin } from "driver-vue";
import "driver-vue/style.css";
import App from "./App.vue";

createApp(App).use(DriverPlugin).mount("#app");
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { DriverTour } from "driver-vue";
</script>

<template>
  <RouterView />
  <DriverTour />
</template>
```

Then highlight an element from any component:

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

const { highlight } = useDriver();

function help() {
  highlight({
    element: "#some-element",
    popover: {
      title: "Title",
      description: "Description",
    },
  });
}
</script>
```

<Demo
  id="install-demo"
  button-text="Highlight the box"
  :highlight="{ element: '#install-demo .demo-box', popover: { title: 'Title', description: 'Description' } }"
>
  <p>Some element on the page.</p>
</Demo>

## Without the plugin

The plugin is a convenience: it provides config defaults and a shared driver for `<DriverTour />` without a prop. You can skip it and pass drivers explicitly:

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";
import "driver-vue/style.css";

const { driver, drive } = useDriver({ steps: [/* ... */] });
</script>

<template>
  <button @click="drive()">Start tour</button>
  <DriverTour :driver="driver" />
</template>
```

## Hints

[Hints](../examples/hints) ship as their own entry so tour-only apps never load them. The stylesheet is shared:

```ts
import { useHints, DriverHints } from "driver-vue/hints";
import "driver-vue/style.css";
```

## Stylesheet

`driver-vue/style.css` contains the driver.js look, expressed as CSS custom properties. Import it once; see [Theming](./theming) for every variable. Nothing stops you from writing your own stylesheet from scratch against the [class names](./theming#class-names) instead.

Continue with [Basic Usage](./basic-usage).
