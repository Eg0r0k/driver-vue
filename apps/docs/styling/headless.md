# Headless

You do not have to render `<DriverTour>`. The engine runs the tour on its own (navigation, hooks, keyboard control, scrolling, the `body` classes, marking the active element) and publishes what it knows in `driver.state`. Your components read it and render whatever you like.

<HeadlessDemo />

## The state

```ts
const { driver, isActive, activeIndex, activeStep, activeElement, stage, popover, transitioning } = useDriver({
  steps: [
    /* ... */
  ],
});
```

| Ref | Meaning |
| --- | --- |
| `isActive` | a tour or highlight is running |
| `activeIndex` | index of the active step |
| `activeStep` | the active step, resolved (with the effective `popover` options) |
| `activeElement` | the highlighted element, `undefined` for a step without an element |
| `stage` | the cutout rect `{ x, y, width, height }` without padding, interpolated during the slide |
| `popover` | the `PopoverRenderModel` to render, `undefined` while the popover is hidden (during the first half of a slide) |
| `transitioning` | the stage is sliding to the next element |

`popover` contains the resolved `title`, `description`, `showButtons`, `disableButtons`, `showProgress`, `progressText` (already interpolated), `nextBtnText`, `prevBtnText`, `doneButton` (the next button ends the tour), `popoverClass`, `showArrow`, `side`, `align`, `offset`, `padding`, `centered`, `smoothScroll` and `scrollBackOnClick`, plus three callbacks, `onNextClick`, `onPrevClick` and `onCloseClick`, that run the configured hooks or the default behaviour. `key` changes on every step, so `:key="popover.key"` remounts your popover per step.

The same values are available without the composable in `driver.state`, a `shallowReactive` object on every driver. There `activeElement` is a placeholder element for a step without an element; `useDriver` turns it into `undefined`.

## Rendering an overlay

The demo uses a simple overlay: a fixed `div` over the stage with a large `box-shadow`. `stage` changes on every frame of the slide, so the cutout animates with no extra code.

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useDriver } from "driver-vue";

const { isActive, stage } = useDriver({
  stagePadding: 6,
  steps: [
    /* ... */
  ],
});

const padding = 6;
const cutout = computed(
  () =>
    stage.value && {
      left: `${stage.value.x - padding}px`,
      top: `${stage.value.y - padding}px`,
      width: `${stage.value.width + padding * 2}px`,
      height: `${stage.value.height + padding * 2}px`,
    }
);
</script>

<template>
  <Teleport to="body">
    <div v-if="isActive && stage" class="cutout" :style="cutout" />
  </Teleport>
</template>

<style>
.cutout {
  position: fixed;
  border-radius: 8px;
  box-shadow: 0 0 0 200vmax rgba(0, 0, 0, 0.6);
  z-index: var(--driver-z-index, 10000);
  pointer-events: none;
}
</style>
```

A `box-shadow` does not receive clicks. To close the tour on a click outside the element, add a separate full-screen click layer, as in [Keeping your UI clickable](#keeping-your-ui-clickable).

For an SVG overlay, `generateStageSvgPathString(stage, { padding, radius })` returns the evenodd path the default overlay uses.

## Positioning a popover

`useDriverPosition` is the composable `<DriverPopover>` uses to place itself. It is built on Floating UI's `useFloating`.

```ts
import { ref } from "vue";
import { useDriverPosition } from "driver-vue";

const card = ref<HTMLElement | null>(null);
const arrow = ref<HTMLElement | null>(null);

const { floatingStyles, arrowStyles, side, arrowSide, align, referenceHidden, update } = useDriverPosition({
  reference: activeElement, // an Element or a { x, y, width, height } rect, or a ref or getter of either
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
<div v-if="popover" ref="card" class="card driver-interactive" :style="floatingStyles" :data-arrow-side="arrowSide">
  <div v-show="arrowSide !== 'over'" ref="arrow" class="arrow" :style="arrowStyles" />
  <strong>{{ popover.title }}</strong>
  <p>{{ popover.description }}</p>
  <button @click="popover.onPrevClick()">Back</button>
  <button @click="popover.onNextClick()">{{ popover.doneButton ? "Done" : "Next" }}</button>
</div>
```

The options:

| Option | Meaning |
| --- | --- |
| `reference` | what the popover points at |
| `floating`, `arrow` | template refs of the popover and of its arrow (the arrow is optional) |
| `side`, `align` | the requested placement |
| `offset` | gap between the padded reference and the popover |
| `padding` | grows the reference rect on every side, so the popover clears the cutout |
| `centered` | ignore the reference and center the popover in the viewport |
| `open` | positioning only runs while this is `true` (default `true`) |
| `strategy` | `"fixed"` (default) positions in the viewport, `"absolute"` in the document |

The popover goes on the requested `side` when the space between the element and the viewport edge on that side holds it. Otherwise it tries the opposite side, then the perpendicular sides (for `left` and `right`: `bottom`, then `top`; for `top` and `bottom`: `left`, then `right`). Only that one axis is checked, so a popover on the right of an element that has scrolled above the viewport stays on the right. When no side has room (an element taller than a phone screen), the popover is centered at the bottom of the viewport and `arrowSide` is `"over"`. The popover is shifted to stay inside the viewport, with a 10 px margin. While its element scrolls away, it sticks to the nearest edge.

What it returns:

| Value | Meaning |
| --- | --- |
| `floatingStyles` | `position`, `left` and `top` for the popover; `transform` is only set for a centered popover |
| `side`, `align` | the rendered placement; `side` is `"over"` when centered |
| `arrowSide` | the popover edge the arrow sits on (see below) |
| `arrowStyles` | the arrow's `left` or `top` offset along that edge |
| `referenceHidden` | the element is entirely outside the viewport |
| `update()` | measure and position again |
| `isPositioned` | the first position has been computed |

`arrowSide` is named like the side: `bottom` means the popover is below the element and the arrow is on its top edge. It is usually equal to `side`. While the element is scrolled away along the other axis (a popover on the right whose element has scrolled above it), the arrow moves to the edge that faces the element. It is `"over"` when there is nothing to point at; hide the arrow then. Putting the arrow on its edge is up to your CSS:

```css
.card[data-arrow-side="bottom"] .arrow {
  top: -6px;
}
.card[data-arrow-side="top"] .arrow {
  bottom: -6px;
}
.card[data-arrow-side="right"] .arrow {
  left: -6px;
}
.card[data-arrow-side="left"] .arrow {
  right: -6px;
}
```

The arrow's size is measured from the `arrow` element's bounding box. For a rotated square, rotate a pseudo-element and leave the element itself unrotated, otherwise the measured width includes the rotation.

`referenceHidden` is what the default popover uses for its `driver-popover-away` class and for `scrollBackOnClick`. In a headless card, use it to show a way back:

```vue
<button v-if="referenceHidden" @click="activeElement?.scrollIntoView({ block: 'center' })">Scroll back</button>
```

The position follows scrolling and resizing through Floating UI's `autoUpdate`; call `update()` after layout changes of your own.

## Keeping your UI clickable

While a tour runs, `driver-vue/style.css` makes the page ignore the pointer, so the reader cannot wander off:

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

Only the highlighted element and `.driver-popover` are exempt. A headless card, your own overlay, a "skip tour" bar in the layout, anything you render outside `.driver-popover` falls under the first rule, and its buttons stop responding.

The `driver-interactive` class opts an element and its descendants back in. The stylesheet contains the rule:

```css
.driver-active .driver-interactive,
.driver-active .driver-interactive * {
  pointer-events: auto;
}
```

Two things are needed:

1. The class, on the element itself and not only on its buttons.
2. A z-index above the overlay. The default overlay is at `zIndex` from the config (`10000` by default) and the default popover at `zIndex + 2`. Anything lower is painted under the dim. The stylesheet's `--driver-z-index` variable has the same default, and the examples on this page use it.

```vue
<template>
  <Teleport to="body">
    <!-- The box-shadow cutout cannot catch clicks, so a separate
         full-screen layer under it does. -->
    <div v-if="isActive" class="click-layer driver-interactive" @click="driver.destroy()" />
    <div v-if="isActive && stage" class="cutout" :style="cutout" />

    <div v-if="popover" ref="card" class="card driver-interactive" :style="floatingStyles">
      <!-- without driver-interactive these buttons would not respond -->
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
  z-index: calc(var(--driver-z-index, 10000) + 2);
}
</style>
```

Giving your popover the `driver-popover` class also exempts it, but it brings the default popover styles along. That suits a custom body inside the default look, less so a headless card.

The same applies outside headless setups: a step counter, a "restart the tour" button or a custom overlay rendered by your app needs `driver-interactive` too.

## What the engine still does

Without `<DriverTour>`:

- `body` gets `driver-active`, `driver-fade` or `driver-simple`, `driver-no-scroll` when `allowScroll` is off, and the `--driver-animation-duration` variable.
- The highlighted element gets `driver-active-element` and its ARIA attributes; its parent gets `driver-active-element-parent`, and `driver-active-element-parent-no-scroll` if it scrolls.
- Escape, the arrow keys and the Tab focus trap work. The focus trap cycles through the highlighted element and `driver.getState("popover")?.wrapper`. To include your card, report its DOM with `driver.__internal.reportPopoverDom({ wrapper, ... })` (a `PopoverDOM` object, with `null` for the parts you do not have); this also runs `onPopoverRender`. Otherwise handle focus yourself.
- A click on the highlighted element advances when `advanceOnClick` is on.
- `scrollAwayBehavior` runs when the element leaves the viewport. `scrollBackOnClick` is implemented by the default popover, so a headless card uses `referenceHidden` instead (see above).

Overlay clicks are yours to forward: call `driver.__internal.overlayClick()` from your overlay to run `overlayClickBehavior`, or call `driver.destroy()` or `driver.moveNext()` directly.
