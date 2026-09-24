# Installation

driver-vue needs Vue 3.5 or later. For Nuxt 4 there is a module, see [Nuxt](./nuxt).

```bash
# npm
npm install driver-vue

# pnpm
pnpm add driver-vue

# yarn
yarn add driver-vue
```

`vue` is a peer dependency. The package depends on `@floating-ui/vue` for popover positioning.

## Setup

Install the plugin and import the stylesheet once:

```ts
// main.ts
import { createApp } from "vue";
import { DriverPlugin } from "driver-vue";
import "driver-vue/style.css";
import App from "./App.vue";

createApp(App).use(DriverPlugin).mount("#app");
```

`useDriver()` creates a driver, and `<DriverTour />` renders it: the overlay and the popover, teleported to `body`. A `<DriverTour />` without a `driver` prop renders the driver of the `useDriver()` call in its own component (or an ancestor), so placing both in the same component is enough:

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

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

<template>
  <button @click="help">Help</button>
  <DriverTour />
</template>
```

<Demo
  id="install-demo"
  button-text="Highlight the box"
  :highlight="{ element: '#install-demo .demo-box', popover: { title: 'Title', description: 'Description' } }"
>
  <p>Some element on the page.</p>
</Demo>

`<DriverTour />` renders nothing while no tour is active. [Basic usage](./basic-usage) continues with tours and the rest of the API.

## One `<DriverTour />` for the app

The plugin also creates an app-wide driver. A `<DriverTour />` in your root component or layout renders it, and any component can use it through `useDriver(config, { shared: true })`:

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <DriverTour />
</template>
```

```ts
// in any component
const { drive } = useDriver({ steps: [/* ... */] }, { shared: true });
```

The app-wide driver keeps running when the component unmounts, which is what a [tour across routes](../examples/multi-page-tour) needs. [Basic usage](./basic-usage#which-driver-drivertour-renders) explains how `<DriverTour />` picks its driver.

## Without the plugin

The plugin is optional. It provides the config `defaults`, the app-wide driver and global component registration (see [Plugin options](./configuration#plugin-options)). Without it, `useDriver()` with a `<DriverTour />` in the same component works as above. A driver made with `createDriver()` is passed as a prop:

```vue
<DriverTour :driver="myDriver" />
```

## Hints

[Hints](../examples/hints) have their own entry point, so an app that only uses tours does not load them. They use the same stylesheet:

```ts
import { useHints, DriverHints } from "driver-vue/hints";
import "driver-vue/style.css";
```

## Stylesheet

`driver-vue/style.css` is the driver.js look, written with CSS custom properties. Import it once. [Theming](./theming) lists every variable and class name, in case you want to change the defaults or write your own stylesheet instead.
