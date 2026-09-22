# driver-vue

A Vue 3 / Nuxt 4 port of [driver.js](https://github.com/nilbuild/driver.js): product tours, feature highlights and hints, with the popover, the overlay, the highlight and the beacons rendered by **your own Vue components**.

- Same configuration, steps, hooks and `Driver` API as driver.js 1.8, so an existing tour runs unchanged.
- Five ways to style it: CSS variables, the driver.js class names, slots, a per-step `component`, or fully headless with the reactive state and `useDriverPosition`.
- Highlight animation you can shape: pluggable `easing`, a decoratable `.driver-stage` box with `--driver-stage-*` variables, Vue `<Transition>` classes on the popover and the overlay, and a replaceable overlay.
- Popover positioning by [Floating UI](https://floating-ui.com/) (flip, shift, arrow, auto-update).
- SSR-safe; a `nuxt-driver-vue` module wires it into Nuxt 4.

## Install

```sh
pnpm add driver-vue
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

Place `<DriverTour />` once (a layout is a good spot). Without a `driver` prop it renders the app-wide driver from `DriverPlugin`; with `:driver="driver"` it renders that instance.

### Your own popover

```vue
<DriverTour :driver="driver">
  <template #popover="{ popover, index, total, isLast, next, prev, close }">
    <MyCard :title="popover.title" :progress="(index + 1) / total">
      <MyButton variant="ghost" @click="prev">Back</MyButton>
      <MyButton @click="next">{{ isLast ? "Finish" : "Next" }}</MyButton>
    </MyCard>
  </template>
</DriverTour>
```

Slots: `popover` (whole body), `title`, `description`, `close`, `footer`, `progress`, `prev`, `next`, `arrow`, `overlay`, `stage`. A step can also carry `popover.component` (a Vue component receiving the same props), and `components.popover` / `components.overlay` in the config set app-wide defaults.

### Highlight animation

```css
.driver-stage {
  outline: 2px solid #6366f1;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.25);
  transition: box-shadow 200ms;
}
.driver-popover-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
```

```ts
useDriver({ duration: 600, easing: t => 1 - Math.pow(1 - t, 3) });
```

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

Guides, live demos and the API reference live in the `apps/docs` VitePress site of the repository (`pnpm docs:dev`).

## License

MIT. driver.js is © Kamran Ahmed, MIT.
