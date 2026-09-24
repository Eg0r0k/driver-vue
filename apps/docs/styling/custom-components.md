# Custom Components

The popover, the overlay and the stage that `<DriverTour>` renders are Vue components. You can replace one part of the popover with a slot, replace the whole popover body, or skip `<DriverTour>` and render the tour yourself ([Headless](./headless)).

| Way | Replaces | Where |
| --- | --- | --- |
| Part slots (`#title`, `#next`, ...) | one part of the default popover | `<DriverTour>` |
| `#popover` slot | the popover body; the positioned wrapper and the arrow stay | `<DriverTour>` |
| `popover.component` | the popover body of one step | step config |
| `components.popover` | the popover body of every step | driver config |
| `#overlay` slot, `components.overlay` | the dimmed overlay | `<DriverTour>`, driver config |
| `#stage` slot | nothing; adds content inside the stage box | `<DriverTour>` |

## Part slots

A part slot replaces one part of the default popover and keeps the rest. The parts are `#arrow`, `#close`, `#title`, `#description`, `#footer`, `#progress`, `#prev` and `#next`. Each receives the [slot props](#slot-props).

<PartSlotsDemo />

The demo replaces three parts:

```vue
<DriverTour :driver="driver">
  <template #title="{ popover, index }">
    <header id="driver-popover-title" class="driver-popover-title">
      <span class="step-label">Step {{ index + 1 }}</span>
      {{ popover.title }}
    </header>
  </template>

  <template #progress="{ index, total }">
    <ProgressDots :current="index + 1" :total="total" />
  </template>

  <template #next="{ next, isLast }">
    <MyButton size="sm" @click="next">{{ isLast ? "Finish" : "Next" }}</MyButton>
  </template>
</DriverTour>
```

A part slot renders only where the default popover would render that part: `#title` and `#description` need a title or description on the step, `#progress` needs `showProgress`, and `#close`, `#prev` and `#next` need the button in `showButtons`. `#footer` replaces the whole footer, including the progress and the buttons. Part slots apply to the default body only; with a `#popover` slot or a component they are ignored, except `#arrow`.

The same pattern covers translated button labels (`#next`, `#prev`) or a description rendered from markdown (`#description`). Keep the driver.js class names on what you render (`driver-popover-title`, `driver-popover-next-btn`, ...) if you want the default styles and `onPopoverRender` to find the elements. The wrapper has `aria-labelledby="driver-popover-title"` and `aria-describedby="driver-popover-description"`, so give your title and description those ids.

### The arrow

The `#arrow` slot replaces the arrow element. It renders only when `showArrow` is on.

```vue
<template #arrow="{ arrowSide, arrowStyles }">
  <svg v-if="arrowSide !== 'over'" class="my-arrow" :data-side="arrowSide" :style="arrowStyles" viewBox="0 0 16 8">
    <path d="M0 8 8 0l8 8z" />
  </svg>
</template>
```

`arrowSide` is the popover edge the arrow sits on, named like the popover side: `bottom` means the popover is below the element, so the arrow is on its top edge and points up. It is usually equal to `side`, but while the element is scrolled out of view the arrow moves to the edge that faces the element. It is `"over"` when there is nothing to point at (a centered step, or no side with room); hide the arrow then. `arrowStyles` is the `left` or `top` offset along that edge, computed for a 10 px arrow. Position the arrow on the edge yourself, for example with `[data-side]` selectors.

## The `#popover` slot

The `#popover` slot replaces the whole body of the popover: the close button, the title, the description and the footer. The wrapper stays: it is positioned for you and carries `.driver-popover`, your `popoverClass`, the side and align classes, and the arrow.

<CustomPopoverDemo />

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { drive, driver } = useDriver({
  popoverClass: "my-popover",
  steps: [
    /* ... */
  ],
});
</script>

<template>
  <button @click="drive()">Start</button>

  <DriverTour :driver="driver">
    <template #popover="{ popover, index, total, isFirst, isLast, next, prev, close }">
      <div class="my-popover-head">
        <strong id="driver-popover-title">{{ popover.title }}</strong>
        <button aria-label="Close" @click="close">&times;</button>
      </div>
      <p id="driver-popover-description">{{ popover.description }}</p>
      <div class="my-popover-bar">
        <span :style="{ width: `${((index + 1) / total) * 100}%` }" />
      </div>
      <div class="my-popover-actions">
        <span>{{ index + 1 }} / {{ total }}</span>
        <MyButton variant="ghost" :disabled="isFirst" @click="prev">Back</MyButton>
        <MyButton @click="next">{{ isLast ? "Finish" : "Next" }}</MyButton>
      </div>
    </template>
  </DriverTour>
</template>

<style>
/* The wrapper is still .driver-popover and reads the popover variables. */
.driver-popover.my-popover {
  --driver-popover-padding: 16px;
  --driver-popover-radius: 8px;
}
</style>
```

The default body renders the title and description as HTML. In a slot you choose: `{{ }}` renders them as text.

### Slot props

Every popover slot (the part slots, `#popover`) and every popover component receives `TourSlotProps`:

```ts
type TourSlotProps = {
  driver: Driver;
  step: DriveStep; // the active step, resolved
  index: number; // -1 for highlight()
  total: number; // number of steps in the config
  element?: Element; // undefined for a step without an element
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrev: boolean;

  popover: PopoverRenderModel; // title, description, button texts, showButtons, doneButton, ...
  side: "top" | "right" | "bottom" | "left" | "over"; // rendered side, "over" when centered
  arrowSide: "top" | "right" | "bottom" | "left" | "over"; // edge the arrow is on, see The arrow
  align: "start" | "center" | "end"; // rendered alignment
  arrowStyles: CSSProperties; // offset of the arrow along its edge
  away: boolean; // the element is scrolled out of the viewport
  scrollBack: () => void; // scroll the element back into view
  next: () => void;
  prev: () => void;
  close: () => void;
};
```

`next`, `prev` and `close` run the same hooks as the default buttons: `onNextClick`, `onPrevClick` and `onCloseClick` of the step or the config if set, `onDoneClick` on the last step, and the default navigation otherwise. Closing still goes through `onDestroyStarted`.

`away` is `true` while the highlighted element is entirely outside the viewport; the popover stays pinned to the nearest edge meanwhile. `scrollBack()` scrolls the element into view again, smoothly when `smoothScroll` is on. Use them for a "back to the element" button in your body. [Element out of view](../examples/scroll-away) describes the behaviour and the options around it.

`step.data` is the place for anything step-specific your body needs (an image URL, a video id).

## A component per step

When steps need different bodies, set a component on the step with `popover.component`. It receives the slot props as props, plus whatever you pass in `popover.props`. Steps without a component keep the default body.

<StepComponentDemo />

```ts
import { useDriver } from "driver-vue";
import NoteStep from "./NoteStep.vue";

const { drive } = useDriver({
  steps: [
    { element: "#title", popover: { title: "Default body", description: "This step has no component." } },
    {
      element: "#export",
      popover: {
        title: "Component body",
        description: "Rendered by NoteStep.vue.",
        component: NoteStep,
        props: { note: "Passed through popover.props." },
      },
    },
  ],
});
```

```vue
<!-- NoteStep.vue -->
<script setup lang="ts">
import type { PopoverRenderModel } from "driver-vue";

defineOptions({ inheritAttrs: false });

defineProps<{
  popover: PopoverRenderModel;
  isLast: boolean;
  next: () => void;
  close: () => void;
  note: string;
}>();
</script>

<template>
  <div>
    <strong id="driver-popover-title">{{ popover.title }}</strong>
    <p id="driver-popover-description">{{ popover.description }}</p>
    <p class="note">{{ note }}</p>
    <MyButton variant="ghost" @click="close">Skip</MyButton>
    <MyButton @click="next">{{ isLast ? "Done" : "Next" }}</MyButton>
  </div>
</template>
```

The component receives every slot prop, whether it declares it or not. Vue adds the props it does not declare to its root element as attributes (`index="1"`, `driver="[object Object]"`, ...), so declare the ones you use and turn attribute inheritance off with `inheritAttrs: false`.

## App-wide components

`components.popover` in the config sets the body for every step that has no `popover.component`:

```ts
import MyPopoverBody from "./MyPopoverBody.vue";

useDriver({
  components: { popover: MyPopoverBody },
});
```

Put the same object in the plugin's `defaults` to apply it to every `useDriver()` in the app. When several are set, the `#popover` slot is used first, then `popover.component`, then `components.popover`, then the default body.

## The overlay

The `#overlay` slot replaces the SVG overlay. It receives the tour props (`driver`, `step`, `index`, `total`, `element`, `isFirst`, `isLast`, `hasNext`, `hasPrev`) and:

| Prop | Meaning |
| --- | --- |
| `stage` | the cutout rect `{ x, y, width, height }` without padding, interpolated during the slide |
| `padding`, `radius` | `stagePadding` and `stageRadius` |
| `color`, `opacity` | `overlayColor` and `overlayOpacity` |
| `zIndex` | the base z-index (`zIndex` in the config, default `10000`) |
| `transitioning` | the stage is sliding to the next element |
| `animated` | `animate` is on, so the engine moves the stage frame by frame |
| `refreshTick` | changes on `driver.refresh()`; measure again when it does |
| `onClick` | call it when the dimmed area is clicked; it runs `overlayClickBehavior` |

This demo replaces the dim with four blurred panels around the cutout:

<CustomOverlayDemo />

```vue
<template>
  <DriverTour :driver="driver">
    <template #overlay="{ stage, padding, zIndex, onClick }">
      <div class="frost" :style="{ zIndex }" @click="onClick">
        <div v-for="(style, i) in panels(stage, padding)" :key="i" class="frost-panel driver-interactive" :style="style" />
      </div>
    </template>
  </DriverTour>
</template>

<script setup lang="ts">
import type { StageRect } from "driver-vue";

function panels(stage: StageRect, padding: number) {
  const x = stage.x - padding;
  const y = stage.y - padding;
  const w = stage.width + padding * 2;
  const h = stage.height + padding * 2;
  return [
    { top: 0, left: 0, right: 0, height: `${y}px` },
    { top: `${y + h}px`, left: 0, right: 0, bottom: 0 },
    { top: `${y}px`, left: 0, width: `${x}px`, height: `${h}px` },
    { top: `${y}px`, left: `${x + w}px`, right: 0, height: `${h}px` },
  ];
}
</script>

<style>
.frost {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.frost-panel {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(6px);
}
</style>
```

While a tour runs, the stylesheet sets `pointer-events: none` on the whole page, so the panels carry `driver-interactive` to receive clicks. See [Keeping your UI clickable](./headless#keeping-your-ui-clickable).

For every driver, set a component in the config instead: `components: { overlay: MyOverlay }`. It receives the same values as props (`stage`, `padding`, `radius`, `color`, `opacity`, `zIndex`, `transitioning`, `animated`, `refreshTick`), gets the `overlayClass` class, and emits `click` for the dimmed area. [`DriverBoxOverlay`](./styling-overlay#the-box-overlay) is a component of this kind.

## The stage

The stage is `.driver-stage`, an empty box over the cutout. Whatever you put in the `#stage` slot renders inside it, positioned relative to it. The slot receives the tour props plus `stage`, `padding`, `radius` and `transitioning`.

```vue
<DriverTour :driver="driver">
  <template #stage="{ index, total }">
    <span class="stage-badge">{{ index + 1 }}/{{ total }}</span>
  </template>
</DriverTour>
```

[Highlight animation](./highlight-animation) has a demo of this slot and shows how to style the stage box.

## Using `<DriverPopover>` directly

`<DriverTour>` renders `<DriverOverlay>`, `<DriverStage>` and `<DriverPopover>`, and all three are exported. `<DriverPopover>` takes a `model` (a `PopoverRenderModel`, for example `driver.state.popover`) and an `anchor` (an element or a rect), positions itself against the anchor and has the same slots as `<DriverTour>`. It emits `render` with the popover's DOM parts once it is mounted:

```vue
<DriverPopover
  v-if="driver.state.popover"
  :key="driver.state.popover.key"
  :model="driver.state.popover"
  :anchor="driver.state.activeElement"
  @render="driver.__internal.reportPopoverDom"
/>
```

Forwarding `render` to the driver runs `onPopoverRender` and includes the popover in the Tab focus trap. The remaining props (`scope`, `zIndex`, `refreshTick`, `mode`, `strategy`) are listed in [Components](../api/components).
