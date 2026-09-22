# Styling Overlay

The overlay is the dimmed page with the highlighted element cut out. Its color and opacity are config options; its shape and animation can be replaced with the `#overlay` slot.

> The examples use `highlight`; the same options apply to tour steps.

## Overlay color and opacity

```ts
const { highlight } = useDriver({
  overlayColor: "red",
  overlayOpacity: 0.3,
});

highlight({
  popover: {
    title: "Pass any color",
    description: "Here we have set the overlay color to red. Any CSS color works.",
  },
});
```

<Demo inline button-text="Red" :config="{ overlayColor: 'red', overlayOpacity: 0.3 }" :highlight="{ popover: { title: 'Pass any color', description: 'Here we have set the overlay color to red. Any CSS color works.' } }" />
<Demo inline button-text="Blue" :config="{ overlayColor: 'blue', overlayOpacity: 0.3 }" :highlight="{ popover: { title: 'Pass any color', description: 'Here we have set the overlay color to blue.' } }" />
<Demo inline button-text="Yellow" :config="{ overlayColor: 'yellow', overlayOpacity: 0.3 }" :highlight="{ popover: { title: 'Pass any color', description: 'Here we have set the overlay color to yellow.' } }" />
<Demo inline button-text="Almost opaque" :config="{ overlayColor: '#0f172a', overlayOpacity: 0.92 }" :highlight="{ element: '#overlay-target', popover: { title: 'Focus', description: 'A darker overlay for a modal feel.' } }" />

<div id="overlay-target" class="demo-box" style="margin-top: 12px"><p>A target for the last button.</p></div>

## Cutout padding and radius

`stagePadding` is the distance between the element and the cutout, `stageRadius` the cutout's corner radius. Both also shape the [stage](../guide/theming#the-stage) box.

<Demo inline button-text="No padding, square" :config="{ stagePadding: 0, stageRadius: 0 }" :highlight="{ element: '#overlay-target', popover: { title: 'Tight', description: 'stagePadding: 0, stageRadius: 0' } }" />
<Demo inline button-text="Roomy, rounded" :config="{ stagePadding: 24, stageRadius: 20 }" :highlight="{ element: '#overlay-target', popover: { title: 'Roomy', description: 'stagePadding: 24, stageRadius: 20' } }" />

## Overlay classes

```css
.driver-overlay {} /* the fixed, full-screen SVG */
.driver-overlay-path {} /* the dim; the only part receiving clicks */
```

The overlay is wrapped in a `<Transition name="driver-overlay">`; the default fades it in over `--driver-animation-duration`. Change the animation with the Vue classes:

```css
.driver-overlay-enter-active {
  transition: opacity 600ms ease;
}

.driver-overlay-enter-from {
  opacity: 0;
}
```

## The box overlay

`DriverBoxOverlay` swaps the SVG for a box with a large `box-shadow`. It looks the same but the cutout is a real element, which lets CSS animate it (see [Highlight animation](./highlight-animation#moving-the-box-with-css-instead-of-javascript)):

```ts
import { DriverBoxOverlay } from "driver-vue";

useDriver({ components: { overlay: DriverBoxOverlay }, steps });
```

`overlayClass` adds a class to whichever overlay is rendered.

## Replacing the overlay

The `#overlay` slot of `<DriverTour>` receives the (interpolated) stage rect, the padding and radius, the color, the opacity, the `zIndex`, a `transitioning` flag and an `onClick` handler that runs `overlayClickBehavior`. Anything you render there replaces the SVG. This demo builds a frosted-glass backdrop from four blurred panels:

<CustomOverlayDemo />

```vue
<template>
  <DriverTour>
    <template #overlay="{ stage, padding, zIndex, onClick }">
      <div class="frost" :style="{ zIndex }" @click="onClick">
        <div v-for="(style, i) in panels(stage, padding)" :key="i" class="frost-panel" :style="style" />
      </div>
    </template>
  </DriverTour>
</template>

<script setup lang="ts">
function panels(stage, padding) {
  const x = stage.x - padding, y = stage.y - padding;
  const w = stage.width + padding * 2, h = stage.height + padding * 2;
  return [
    { top: 0, left: 0, right: 0, height: `${y}px` },
    { top: `${y + h}px`, left: 0, right: 0, bottom: 0 },
    { top: `${y}px`, left: 0, width: `${x}px`, height: `${h}px` },
    { top: `${y}px`, left: `${x + w}px`, right: 0, height: `${h}px` },
  ];
}
</script>

<style>
.frost { position: fixed; inset: 0; pointer-events: none; }
.frost-panel {
  position: absolute;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
}
</style>
```

A global replacement goes in the config instead of the slot: `components: { overlay: MyOverlay }`. The component receives the same values as props (`stage`, `padding`, `radius`, `color`, `opacity`, `zIndex`, `transitioning`, `refreshTick`) and emits `click`.

The page stays interactive only inside the cutout because `driver-vue/style.css` sets `pointer-events: none` on everything under `.driver-active` except the highlighted element and the popover; a custom overlay does not change that.
