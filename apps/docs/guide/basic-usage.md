# Basic Usage

There are three pieces:

- **`useDriver(config)`** (or `createDriver(config)`) creates the tour engine: it owns the config, the steps, the hooks, the keyboard control and the reactive state.
- **`<DriverTour />`** renders that state: the overlay, the stage cutout and the popover. It teleports to `body` and is empty until a tour runs.
- **`driver-vue/style.css`** is the default look.

The configuration is the driver.js configuration, documented in [Configuration](./configuration).

## A tour with several steps

<Demo
  id="basic-tour"
  title="Basic tour"
  :config="{ showProgress: true }"
  :steps="[
    { element: '#basic-box', popover: { title: 'Highlight anything', description: 'You can highlight anything on the page.' } },
    { element: '#basic-summary', popover: { title: 'Control with keyboard', description: 'Use the arrow keys and Escape.' } },
    { popover: { title: 'Centered steps', description: 'A step without an element is centered, like a modal.' } },
    { element: '#basic-export', popover: { title: 'Control with code', description: 'Every step is a plain object.', side: 'bottom', align: 'start' } },
  ]"
>
  <DemoBox prefix="basic" />
</Demo>

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

const { drive } = useDriver({
  showProgress: true,
  steps: [
    { element: ".page-header", popover: { title: "Title", description: "Description" } },
    { element: ".top-nav", popover: { title: "Title", description: "Description" } },
    { popover: { title: "Centered", description: "No element, centered like a modal." } },
    { element: ".footer", popover: { title: "Title", description: "Description" } },
  ],
});
</script>

<template>
  <button @click="drive()">Start the tour</button>
</template>
```

`useDriver` merges the plugin's `defaults` under your config, destroys the tour when the component unmounts, and returns the driver plus reactive refs (`isActive`, `activeIndex`, `isFirstStep`, ...). It re-applies the config when you pass a ref or a getter.

## Which driver does `<DriverTour />` render?

`<DriverTour>` renders the driver you pass as `:driver`. Without the prop it looks up the nearest provided driver:

1. the driver of a `useDriver()` call in an ancestor component (`useDriver` provides its driver to its subtree, so a `<DriverTour />` in the same component renders it),
2. a driver shared with `provideDriver()`,
3. the app-wide driver installed by `DriverPlugin` (`useDriver(config, { shared: true })` drives that one).

When in doubt, pass `:driver="driver"` explicitly; a `<DriverTour />` placed in a layout with the plugin installed renders the shared instance.

## Highlighting a single element

Pass one step to `highlight` to spotlight an element without a tour. By default the popover shows no buttons.

<Demo
  id="basic-highlight"
  button-text="Highlight the element"
  :highlight="{ element: '#basic-highlight .demo-box', popover: { title: 'Title for the popover', description: 'Description for it' } }"
>
  <p>Some element to highlight.</p>
</Demo>

```ts
const { highlight } = useDriver();

highlight({
  element: "#some-element",
  popover: {
    title: "Title for the popover",
    description: "Description for it",
  },
});
```

## The reactive state

Everything the tour knows is reactive. The buttons below are wired to the refs returned by `useDriver`:

<ComposableDemo />

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

const { drive, moveNext, movePrevious, destroy, isActive, activeIndex, isFirstStep, isLastStep } = useDriver({
  showButtons: ["close"],
  steps: [/* ... */],
});
</script>

<template>
  <button @click="drive()">Start</button>
  <button :disabled="!isActive || isFirstStep" @click="movePrevious()">Previous</button>
  <button :disabled="!isActive" @click="moveNext()">{{ isLastStep ? "Finish" : "Next" }}</button>
  <button :disabled="!isActive" @click="destroy()">Stop</button>
</template>
```

## Without a component

`createDriver` (alias `driver`, as in driver.js) works anywhere, for example in a Pinia store or a plain module. Pass the instance to `<DriverTour :driver>` or share it through `provideDriver`.

```ts
import { createDriver } from "driver-vue";

export const onboarding = createDriver({
  steps: [/* ... */],
});
```

## Hints

Beyond tours, driver-vue ships hints: pulsing beacons that open a popover when clicked, with no overlay and nothing blocked. See the [Hints example](../examples/hints).

```vue
<script setup lang="ts">
import { useHints, DriverHints } from "driver-vue/hints";

const { hints, show } = useHints({
  hints: [
    { element: "#export-btn", popover: { title: "Export your data", description: "Download as CSV or PDF." } },
    { element: "#summary", popover: { title: "Auto-generated summary", description: "Written from the numbers." } },
  ],
});
</script>

<template>
  <button @click="show()">Show hints</button>
  <DriverHints :hints="hints" />
</template>
```

Find every option in [Configuration](./configuration), and the many ways to restyle the tour under [Styling](../styling/styling-popover).
