# Basic Usage

A tour is made of three pieces:

- `useDriver(config)` or `createDriver(config)` creates the driver. It holds the config, the steps, the hooks, the keyboard control and the reactive state.
- `<DriverTour />` renders that state: the overlay, the cutout around the element (the stage) and the popover. It teleports to `body` and renders nothing while no tour is active.
- `driver-vue/style.css` is the default look.

[Installation](./installation) shows how to set them up. The config is the driver.js config, listed in [Configuration](./configuration).

## A tour

Pass the steps to `useDriver` and call `drive()`. A step with an `element` points at that element; a step without one is centered on the screen.

<Demo
  id="basic-tour"
  title="Basic tour"
  button-text="Start the tour"
  :config="{ showProgress: true }"
  :steps="[
    { element: '#basic-box', popover: { title: 'The panel', description: 'The first step highlights the whole panel.' } },
    { element: '#basic-summary', popover: { title: 'Keyboard', description: 'The arrow keys move between steps, Escape closes the tour.' } },
    { popover: { title: 'Centered step', description: 'This step has no element, so the popover is centered.' } },
    { element: '#basic-export', popover: { title: 'Placement', description: 'This step sets side: bottom and align: start.', side: 'bottom', align: 'start' } },
  ]"
>
  <DemoBox prefix="basic" />
</Demo>

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { drive } = useDriver({
  showProgress: true,
  steps: [
    { element: ".page-header", popover: { title: "Title", description: "Description" } },
    { element: ".top-nav", popover: { title: "Title", description: "Description" } },
    { popover: { title: "Centered", description: "A step without an element." } },
    { element: ".footer", popover: { title: "Title", description: "Description" } },
  ],
});
</script>

<template>
  <button @click="drive()">Start the tour</button>
  <DriverTour />
</template>
```

`useDriver`:

- merges the plugin's `defaults` under your config,
- re-applies the config when you pass a ref or a getter and it changes,
- provides the driver to the component's subtree, so the `<DriverTour />` next to it renders it,
- destroys the tour when the component unmounts,
- returns the driver, its methods and reactive refs (see [The reactive state](#the-reactive-state)).

`drive(index)` starts the tour at a given step.

## Highlighting a single element

`highlight(step)` shows one step without a tour, as in the [Installation](./installation#setup) example. It takes the same step object as `steps`. The popover has no buttons unless you set `showButtons` on the step, and a click on the overlay or Escape closes it.

```ts
const { highlight } = useDriver();

highlight({
  element: "#some-element",
  popover: {
    title: "Title",
    description: "Description",
    showButtons: ["close"],
  },
});
```

More single-element cases are in [Simple highlight](../examples/simple-highlight).

## The reactive state

The refs returned by `useDriver` update as the tour moves. The buttons under the panel below use them:

<ComposableDemo />

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { drive, moveNext, movePrevious, destroy, isActive, activeIndex, isFirstStep, isLastStep } = useDriver({
  showButtons: ["close"],
  steps: [
    /* ... */
  ],
});
</script>

<template>
  <button @click="drive()">Start</button>
  <button :disabled="!isActive || isFirstStep" @click="movePrevious()">Previous</button>
  <button :disabled="!isActive" @click="moveNext()">{{ isLastStep ? "Finish" : "Next" }}</button>
  <button :disabled="!isActive" @click="destroy()">Stop</button>
  <span>Step {{ activeIndex }}</span>
  <DriverTour />
</template>
```

The refs are `isActive`, `activeIndex`, `activeStep`, `activeElement`, `previousStep`, `previousElement`, `stage`, `popover`, `transitioning`, `isFirstStep`, `isLastStep`, `hasNextStep` and `hasPreviousStep`. The same data is on `driver.state`; [Headless](../styling/headless) shows how to render a tour from it.

## Which driver `<DriverTour />` renders

`<DriverTour>` renders the driver passed as `:driver`. Without the prop it uses the nearest provided driver:

1. the driver of a `useDriver()` call in the same component or an ancestor,
2. a driver shared with `provideDriver(driver)`,
3. the app-wide driver created by `DriverPlugin`.

A `<DriverTour />` in the root component is outside the components that call `useDriver()`, so it renders the app-wide driver. `useDriver(config, { shared: true })` sets the config on that driver instead of creating a new one, and does not destroy it on unmount (see [Installation](./installation#one-drivertour-for-the-app)).

## Outside components

`createDriver(config)` works anywhere, for example in a Pinia store or a plain module. `driver` is an alias, as in driver.js. The driver is not destroyed automatically; call `destroy()` when you are done with it.

```ts
import { createDriver } from "driver-vue";

export const onboarding = createDriver({
  steps: [
    /* ... */
  ],
});
```

Render it with `<DriverTour :driver="onboarding" />`, or call `provideDriver(onboarding)` in a parent component so a `<DriverTour />` below it picks it up.

## Changing the look

The popover can be restyled with CSS variables ([Styling popover](../styling/styling-popover)) or replaced with your own markup through slots and components ([Custom components](../styling/custom-components)).

Hints, beacons that open a popover on click without blocking the page, are described in [Hints](../examples/hints).
