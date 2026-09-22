# Headless

Nothing forces you to render `<DriverTour>`. The engine runs the tour on its own – navigation, hooks, keyboard control, scrolling, the `body` classes, marking the active element – and publishes everything it knows in `driver.state`. Read it and render whatever you like.

<HeadlessDemo />

## The state

```ts
const { driver, isActive, activeIndex, activeStep, activeElement, stage, popover, transitioning } = useDriver({
  steps: [/* ... */],
});
```

| Ref | Meaning |
| --- | --- |
| `isActive` | a tour or highlight is running |
| `activeIndex` | index of the active step |
| `activeStep` | the resolved step (with the effective `popover` options) |
| `activeElement` | the highlighted element, `undefined` for a centered step |
| `stage` | the cutout rect `{ x, y, width, height }` without padding, interpolated during the slide |
| `popover` | the `PopoverRenderModel` to render, `undefined` while the popover is hidden (during the first half of a slide) |
| `transitioning` | the slide is in flight |

`popover` has the resolved title, description, `showButtons`, `disableButtons`, `progressText` (already interpolated), `nextBtnText`, `prevBtnText`, `doneButton`, `popoverClass`, `side`, `align`, `offset`, `padding`, `centered`, plus the three callbacks `onNextClick`, `onPrevClick`, `onCloseClick` that run the configured hooks or the default behaviour.

The same values are available without the composable as `driver.state` (a `shallowReactive` object) on any driver.

## Rendering an overlay

The demo uses the cheapest possible overlay: a fixed `div` over the stage with a huge `box-shadow`. Because `stage` updates every frame of the slide, the cutout animates with no extra work.

```vue
<template>
  <Teleport to="body">
    <div v-if="isActive && stage" class="cutout" :style="cutout" />
  </Teleport>
</template>

<script setup lang="ts">
const padding = 6;
const cutout = computed(() => stage.value && {
  left: `${stage.value.x - padding}px`,
  top: `${stage.value.y - padding}px`,
  width: `${stage.value.width + padding * 2}px`,
  height: `${stage.value.height + padding * 2}px`,
});
</script>

<style>
.cutout {
  position: fixed;
  border-radius: 8px;
  box-shadow: 0 0 0 100vmax rgba(20, 20, 40, 0.7);
  z-index: var(--driver-z-index, 10000);
  pointer-events: none;
}
</style>
```

The dim here is a `box-shadow`, which cannot receive clicks; if you want clicking outside to close the tour, add a separate full-screen click layer, as described in [Keeping your UI clickable](#keeping-your-ui-clickable-driver-interactive).

If you prefer the SVG path, `generateStageSvgPathString(stage, { padding, radius })` is exported and returns the evenodd path the default overlay uses.

## Positioning a popover

`useDriverPosition` is the positioning composable behind `<DriverPopover>`, a thin layer over Floating UI's `useFloating` with driver.js semantics: the reference rect is expanded by `padding` (so the popover clears the cutout), `offset` is the gap, the requested `side` flips when it does not fit, the popover shifts to stay in the viewport, and `centered` puts it in the middle of the screen.

```ts
import { useDriverPosition } from "driver-vue";

const card = ref<HTMLElement | null>(null);
const arrow = ref<HTMLElement | null>(null);

const { floatingStyles, arrowStyles, side, align, update } = useDriverPosition({
  reference: activeElement, // Element, a rect, or a ref/getter of either
  floating: card,
  arrow,
  side: () => popover.value?.side ?? "bottom",
  align: () => popover.value?.align ?? "start",
  offset: () => popover.value?.offset ?? 10,
  padding: () => popover.value?.padding ?? 0,
  centered: () => popover.value?.centered ?? false,
  open: () => !!popover.value,
});
```

```vue
<div v-if="popover" ref="card" class="card driver-interactive" :style="floatingStyles" :data-side="side">
  <div ref="arrow" class="arrow" :style="arrowStyles" />
  <strong>{{ popover.title }}</strong>
  <p>{{ popover.description }}</p>
  <button @click="popover.onPrevClick()">Back</button>
  <button @click="popover.onNextClick()">{{ popover.doneButton ? "Done" : "Next" }}</button>
</div>
```

`floatingStyles` are `position: fixed; left; top` (no `transform`, so yours is free). `arrowStyles` is the offset along the popover edge; put the arrow on the right edge yourself with `data-side`. `side` is `"over"` when centered. The position follows scroll and resize through Floating UI's `autoUpdate`; call `update()` after your own layout changes.

## What the engine still does

Even without `<DriverTour>`:

- `body` gets `driver-active` (+ `driver-fade` / `driver-simple`, `driver-no-scroll`) and `--driver-animation-duration`.
- The highlighted element gets `driver-active-element` and the ARIA attributes; its scrollable parent gets `driver-active-element-parent-no-scroll`.
- Escape, the arrow keys and Tab trapping work. Tab trapping looks for focusable elements in `driver.getState("popover")?.wrapper`; report your popover's DOM with `driver.__internal.reportPopoverDom({ wrapper, ... })` if you want it included, or handle focus yourself.
- Clicking the highlighted element with `advanceOnClick` advances.
- Overlay clicks are yours to forward: call `driver.__internal.overlayClick()` from your overlay to run `overlayClickBehavior`, or just call `driver.destroy()` / `driver.moveNext()`.

## Keeping your UI clickable: `driver-interactive`

This is the one thing that catches everybody out. While a tour runs, `driver-vue/style.css` makes the whole page inert so the reader cannot wander off:

```css
.driver-active * {
  pointer-events: none;
}

.driver-active .driver-active-element,
.driver-active .driver-active-element *,
.driver-popover,
.driver-popover * {
  pointer-events: auto;
}
```

Only the highlighted element and `.driver-popover` are exempt. A headless card, your own overlay, a "skip tour" bar in the layout — anything you render outside `.driver-popover` — is covered by that first rule, and its buttons silently stop responding: the clicks never reach them.

Add the `driver-interactive` class to opt back in. The stylesheet ships the rule:

```css
.driver-active .driver-interactive,
.driver-active .driver-interactive * {
  pointer-events: auto;
}
```

Two things are needed, and both are easy to forget:

1. **The class**, on the element and not only on its buttons — it also covers the descendants.
2. **A z-index above the overlay.** The overlay sits at `--driver-z-index` (`10000` by default); the default popover is at `calc(var(--driver-z-index) + 2)`. Anything below that is painted under the dim and, if the overlay catches clicks, unreachable anyway.

```vue
<template>
  <Teleport to="body">
    <!-- The dim. A box-shadow cannot catch clicks, so the click layer is a
         separate full-screen div under the cutout. -->
    <div v-if="isActive" class="click-layer driver-interactive" @click="driver.destroy()" />
    <div v-if="isActive && stage" class="cutout" :style="cutoutStyle" />

    <div v-if="popover" ref="card" class="card driver-interactive" :style="floatingStyles">
      <!-- these buttons would do nothing without `driver-interactive` -->
      <button @click="popover.onPrevClick()">Back</button>
      <button @click="popover.onNextClick()">Next</button>
    </div>
  </Teleport>
</template>

<style>
.click-layer {
  position: fixed;
  inset: 0;
  z-index: calc(var(--driver-z-index, 10000) - 1);
}

.card {
  position: fixed;
  z-index: calc(var(--driver-z-index, 10000) + 2);
}
</style>
```

The alternative is to give your popover the `driver-popover` class, which is already exempt — useful when you keep the default look and only replace the body, less so headless, where the class also brings the default popover styling with it.

The same applies outside headless setups: a step-counter bar, a "restart the tour" button or a custom overlay rendered by your app needs `driver-interactive` too. Writing the equivalent rule yourself works just as well; the class only saves you the trouble.
