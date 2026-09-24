# Styling Overlay

The overlay is the dimmed page with the highlighted element cut out. Its color and opacity are config options, and so are the padding and the corner radius of the cutout. The examples below use `highlight()`; the same options apply to tours.

## Overlay color and opacity

`overlayColor` takes any CSS color (default `#000`), `overlayOpacity` a number from `0` to `1` (default `0.7`).

```ts
const { highlight } = useDriver({
  overlayColor: "red",
  overlayOpacity: 0.3,
});

highlight({
  popover: {
    title: "Red overlay",
    description: "overlayColor: red, overlayOpacity: 0.3",
  },
});
```

<Demo inline button-text="Red, 0.3" :config="{ overlayColor: 'red', overlayOpacity: 0.3 }" :highlight="{ popover: { title: 'Red overlay', description: 'overlayColor: red, overlayOpacity: 0.3' } }" />
<Demo inline button-text="White, 0.7" :config="{ overlayColor: '#fff', overlayOpacity: 0.7 }" :highlight="{ element: '#overlay-target', popover: { title: 'White overlay', description: 'overlayColor: #fff, overlayOpacity: 0.7' } }" />
<Demo inline button-text="Almost opaque" :config="{ overlayColor: '#0f172a', overlayOpacity: 0.92 }" :highlight="{ element: '#overlay-target', popover: { title: 'Dark overlay', description: 'overlayColor: #0f172a, overlayOpacity: 0.92' } }" />

<div id="overlay-target" class="demo-box" style="margin-top: 12px"><p>The element the last two buttons highlight.</p></div>

## Cutout padding and radius

`stagePadding` is the distance between the element and the edge of the cutout (default `10`), `stageRadius` the radius of the cutout's corners (default `5`). Both also shape the [stage box](./highlight-animation#the-stage-box) and move the popover, which keeps its distance from the cutout.

<Demo inline button-text="No padding, square" :config="{ stagePadding: 0, stageRadius: 0 }" :highlight="{ element: '#overlay-target', popover: { title: 'Tight', description: 'stagePadding: 0, stageRadius: 0' } }" />
<Demo inline button-text="Wide, rounded" :config="{ stagePadding: 24, stageRadius: 20 }" :highlight="{ element: '#overlay-target', popover: { title: 'Wide', description: 'stagePadding: 24, stageRadius: 20' } }" />

## Overlay classes

The default overlay is a full-screen SVG, `.driver-overlay`, with one path, `.driver-overlay-path`. The path is the dimmed area and the only part that receives clicks. `overlayClass` in the config adds a class to the overlay root, so a rule can target one tour. The overlay fades in through a Vue transition named `driver-overlay`; [Highlight animation](./highlight-animation#popover-and-overlay-transitions) shows how to change it.

## The box overlay

`DriverBoxOverlay` replaces the SVG with an element that has a large `box-shadow`. It looks the same, but the cutout is a real element (`.driver-box-overlay-cutout`), so CSS can animate it (see [Moving the box with CSS](./highlight-animation#moving-the-box-with-css)):

```ts
import { DriverBoxOverlay } from "driver-vue";

useDriver({ components: { overlay: DriverBoxOverlay }, steps });
```

## Your own overlay

To draw the overlay with your own markup, use the `#overlay` slot of `<DriverTour>` or a component in `components.overlay`. Both are described in [Custom components](./custom-components#the-overlay), with a demo.

The page is clickable only inside the cutout because `driver-vue/style.css` sets `pointer-events: none` on everything under `.driver-active` except the highlighted element and the popover. A custom overlay does not change that; see [Keeping your UI clickable](./headless#keeping-your-ui-clickable).
