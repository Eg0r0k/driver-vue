<p align="center">
  <img src="https://raw.githubusercontent.com/Eg0r0k/driver-vue/master/logo.svg" width="120" alt="driver-vue" />
</p>

<h1 align="center">driver-vue</h1>

<p align="center">
  Product tours, highlights and hints for Vue 3, rendered with your own components.<br />
  A port of <a href="https://github.com/nilbuild/driver.js">driver.js</a>: same API, same class names, your markup.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/driver-vue"><img src="https://img.shields.io/npm/v/driver-vue?color=3866e8" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/driver-vue"><img src="https://img.shields.io/npm/dm/driver-vue?color=3866e8" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/driver-vue"><img src="https://img.shields.io/bundlephobia/minzip/driver-vue?color=3866e8&label=minzip" alt="bundle size" /></a>
  <a href="https://github.com/Eg0r0k/driver-vue/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-3866e8" alt="MIT" /></a>
</p>

## Install

```sh
pnpm add driver-vue
```

Nuxt 4: `pnpm add nuxt-driver-vue` and add `"nuxt-driver-vue"` to `modules`.

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

### Your own popover

```vue
<DriverTour>
  <template #popover="{ popover, index, total, isLast, next, prev, close }">
    <MyCard :title="popover.title" :progress="(index + 1) / total">
      <MyButton variant="ghost" @click="close">Skip</MyButton>
      <MyButton @click="prev">Back</MyButton>
      <MyButton @click="next">{{ isLast ? "Finish" : "Next" }}</MyButton>
    </MyCard>
  </template>
</DriverTour>
```

Slots: `popover`, `title`, `description`, `close`, `footer`, `progress`, `prev`, `next`, `arrow`, `overlay`, `stage`. A step can carry `popover.component`; `components.popover` / `components.overlay` set app-wide defaults; `useDriver().state` plus `useDriverPosition` cover the fully headless case.

### Highlight animation

```ts
useDriver({ duration: 600, easing: t => 1 - Math.pow(1 - t, 3), stageClass: "glow" });
```

```css
.driver-stage.glow {
  box-shadow: 0 0 0 3px rgba(56, 102, 232, 0.9), 0 0 24px 6px rgba(56, 102, 232, 0.5);
}
```

`DriverBoxOverlay` with `animate: false` moves the box with a CSS transition instead.

### Hints

```vue
<script setup lang="ts">
import { useHints, DriverHints } from "driver-vue/hints";

const { hints, show } = useHints({
  hints: [{ element: "#search", popover: { title: "Search", description: "Press / to focus." } }],
});
</script>

<template>
  <button @click="show()">Show hints</button>
  <DriverHints :hints="hints" />
</template>
```

## Documentation

Guides, live demos and the API reference: [eg0r0k.github.io/driver-vue](https://eg0r0k.github.io/driver-vue/).

## License

MIT. driver.js is © Kamran Ahmed, MIT.
