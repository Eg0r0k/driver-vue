# Custom Components

This is why driver-vue exists: the popover, the overlay and the stage are Vue components, and every part of them can be replaced with your own markup, your design system's buttons, your icons and your translations.

There are three ways, from narrowest to broadest:

| Way | Replaces | Where |
| --- | --- | --- |
| Part slots (`#title`, `#next`, ...) | one part of the default popover | `<DriverTour>` |
| `#popover` slot | the whole popover body (arrow and positioning stay) | `<DriverTour>` |
| `popover.component` / `components.popover` | the whole body, per step or globally | config |

Below that there is [Headless](./headless), where you render everything yourself.

## The `#popover` slot

The body of the popover is the default slot of `<DriverPopover>`, exposed on `<DriverTour>` as `#popover`. The wrapper stays: it is positioned by Floating UI, carries `.driver-popover`, your `popoverClass`, the side/align classes, and the arrow.

<CustomPopoverDemo />

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { drive } = useDriver({
  popoverClass: "my-popover",
  steps: [/* ... */],
});
</script>

<template>
  <button @click="drive()">Start</button>

  <DriverTour>
    <template #popover="{ popover, index, total, isFirst, isLast, next, prev, close }">
      <div class="cp">
        <div class="cp-head">
          <span class="cp-avatar">🧭</span>
          <div>
            <strong>{{ popover.title }}</strong>
            <p>{{ popover.description }}</p>
          </div>
          <button aria-label="Close" @click="close">✕</button>
        </div>
        <div class="cp-bar"><span :style="{ width: `${((index + 1) / total) * 100}%` }" /></div>
        <div class="cp-actions">
          <span>{{ index + 1 }} / {{ total }}</span>
          <MyButton variant="ghost" :disabled="isFirst" @click="prev">Back</MyButton>
          <MyButton @click="next">{{ isLast ? "Finish" : "Continue" }}</MyButton>
        </div>
      </div>
    </template>
  </DriverTour>
</template>

<style>
/* The wrapper is still .driver-popover; zero its padding for a full-bleed body. */
.driver-popover.my-popover {
  --driver-popover-padding: 0;
  --driver-popover-radius: 14px;
}
</style>
```

Note that with a slot the title and description are yours to render, so you can use `{{ }}` (escaped text) instead of the default's HTML.

### Slot props

Every popover slot receives `TourSlotProps`:

```ts
type TourSlotProps = {
  driver: Driver;
  step: DriveStep; // the resolved active step
  index: number; // -1 for a bare highlight()
  total: number; // steps in the tour, 0 for a bare highlight()
  element?: Element; // undefined for a centered step
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrev: boolean;

  popover: PopoverRenderModel; // title, description, texts, buttons, doneButton, ...
  side: "top" | "right" | "bottom" | "left" | "over"; // rendered side
  align: "start" | "center" | "end";
  arrowStyles: CSSProperties; // for a custom arrow (see the #arrow slot)
  next: () => void; // runs the step's / config's onNextClick, else advances
  prev: () => void;
  close: () => void;
};
```

`next`, `prev` and `close` go through the same hook resolution as the default buttons, so `onNextClick`, `onDoneClick`, `onDestroyStarted` and friends keep working. `step.data` is where you carry anything step-specific (an image, a video id, a component name).

## Part slots

Replace just one part and keep the rest of the default popover. Available: `#arrow`, `#close`, `#title`, `#description`, `#footer`, `#progress`, `#prev`, `#next`. They receive the same props.

<Demo
  id="parts-demo"
  button-text="Run the default popover (see the code for slots)"
  :config="{ showProgress: true }"
  :steps="[
    { element: '#parts-title', popover: { title: 'Default parts', description: 'This demo runs the shared driver without slots; the snippet shows how to replace a part.' } },
    { element: '#parts-export', popover: { title: 'Another step', description: 'The layout of the default popover is unchanged.', side: 'right' } },
  ]"
>
  <DemoBox prefix="parts" />
</Demo>

```vue
<DriverTour>
  <!-- A translated, icon-carrying next button; the footer and progress are still the defaults. -->
  <template #next="{ next, isLast }">
    <MyButton size="sm" @click="next">
      {{ isLast ? t("tour.finish") : t("tour.next") }}
      <ArrowRightIcon />
    </MyButton>
  </template>

  <!-- A markdown-rendered description instead of HTML. -->
  <template #description="{ popover }">
    <div class="driver-popover-description"><Markdown :source="popover.description" /></div>
  </template>

  <!-- A custom progress indicator. -->
  <template #progress="{ index, total }">
    <ProgressDots :current="index + 1" :total="total" />
  </template>
</DriverTour>
```

Keep the driver.js class names on the elements you render (`driver-popover-title`, `driver-popover-next-btn`, ...) if you want the stylesheet and `onPopoverRender` to see them.

## A component per step

For steps that need different bodies (a video step, a form step, a plain one), put a component on the step itself. It receives the slot props as props, plus whatever you pass in `popover.props`.

<StepComponentDemo />

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";
import VideoStep from "./VideoStep.vue";

const { drive } = useDriver({
  steps: [
    // Default body
    { element: "#title", popover: { title: "Default", description: "Built-in body." } },
    // Custom body
    {
      element: "#export",
      popover: {
        title: "A component step",
        description: "Rendered by VideoStep.vue",
        component: VideoStep,
        props: { videoId: "abc123" },
      },
    },
  ],
});
</script>
```

```vue
<!-- VideoStep.vue -->
<script setup lang="ts">
import type { TourSlotProps } from "driver-vue";

defineProps<TourSlotProps & { videoId: string }>();
</script>

<template>
  <div class="video-step">
    <iframe :src="`https://player.example/${videoId}`" />
    <strong>{{ popover.title }}</strong>
    <p>{{ popover.description }}</p>
    <MyButton variant="ghost" @click="close">Skip</MyButton>
    <MyButton @click="next">{{ isLast ? "Done" : "Next" }}</MyButton>
  </div>
</template>
```

A global default goes in the config and applies to every step without its own component:

```ts
useDriver({
  components: { popover: MyPopoverBody, overlay: MyOverlay },
});
```

Precedence for the body: `#popover` slot → `popover.component` → `components.popover` → the default.

## The arrow

The `#arrow` slot replaces the arrow element. Apply `arrowStyles` (the offset along the edge) and use `side` to pick which edge:

```vue
<template #arrow="{ side, arrowStyles }">
  <svg class="my-arrow" :data-side="side" :style="arrowStyles" viewBox="0 0 16 8"><path d="M0 8 8 0l8 8z" /></svg>
</template>
```

The default arrow is a CSS triangle whose color follows `--driver-popover-arrow-color`.

## The overlay and the stage

The overlay and the stage have their own slots, `#overlay` and `#stage`; see [Styling Overlay](./styling-overlay) and [Highlight Animation](./highlight-animation).

## Using `<DriverPopover>` directly

`<DriverPopover>` is exported and usable on its own: give it a `model` (a `PopoverRenderModel`) and an `anchor`, and it renders, positions and reports itself. `<DriverTour>` and `<DriverHints>` are thin compositions of it, so a custom tour renderer can reuse it. See the [Components](../api/components) reference.
