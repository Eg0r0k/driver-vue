# Highlight Animation

The highlight has three moving parts, each customizable on its own:

1. **The stage slide** – the cutout easing from one element to the next. Configured with `duration` and `easing`.
2. **The stage box** – `.driver-stage`, an empty element that tracks the cutout and can carry any decoration.
3. **The transitions** – Vue `<Transition>` classes on the overlay and the popover.

<GlowStageDemo />

## Duration and easing

`duration` (ms) is the length of the slide and, through the `--driver-animation-duration` variable set on `<body>`, of the default fades. `easing` is any function from normalized time to normalized progress; driver.js's ease-in-out quad is the default.

```ts
const easeOutBack = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

useDriver({
  duration: 700,
  easing: easeOutBack,
});
```

`animate: false` disables the slide and the fades; the popover and the cutout then jump between steps.

## The stage box

`.driver-stage` is positioned over the cutout (element box plus `stagePadding`, rounded by `stageRadius`), is `pointer-events: none`, and has no visual by default. While the slide runs it carries `data-transitioning`.

```css
.driver-stage {
  box-shadow:
    0 0 0 2px rgba(99, 102, 241, 0.9),
    0 0 24px 6px rgba(99, 102, 241, 0.55);
  animation: stage-pulse 1.6s ease-in-out infinite;
}

.driver-stage[data-transitioning] {
  animation: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
}

@keyframes stage-pulse {
  50% {
    box-shadow:
      0 0 0 4px rgba(99, 102, 241, 0.6),
      0 0 36px 12px rgba(99, 102, 241, 0.25);
  }
}
```

The rect is also available as CSS variables on the element, for pseudo-elements and for animations that need the numbers: `--driver-stage-x`, `--driver-stage-y`, `--driver-stage-width`, `--driver-stage-height`, `--driver-stage-radius`.

### The `#stage` slot

Whatever you put in the `#stage` slot renders inside `.driver-stage`, positioned relative to it. The demo above adds a step badge in the corner:

```vue
<DriverTour>
  <template #stage="{ index, total, transitioning }">
    <span class="badge">{{ index + 1 }}/{{ total }}</span>
  </template>
</DriverTour>
```

The slot receives the tour scope (`driver`, `step`, `index`, `total`, `element`, `isFirst`, `isLast`, ...) plus `stage`, `padding`, `radius` and `transitioning`.

## Popover and overlay transitions

The popover is wrapped in `<Transition name="driver-popover" appear>` and remounts on every step, so its enter transition plays per step. The overlay is wrapped in `<Transition name="driver-overlay" appear>` and enters once per tour. Override the Vue classes:

```css
.driver-popover-enter-active {
  transition:
    opacity 300ms ease-out,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.driver-popover-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.driver-overlay-enter-active {
  transition: opacity 600ms ease;
}

.driver-overlay-enter-from {
  opacity: 0;
}
```

The default rules only apply under `.driver-fade` (an animated tour) and respect `prefers-reduced-motion`. Write yours without the `.driver-fade` guard if you want them regardless of `animate`.

Because the popover is positioned with `left` / `top`, `transform` is free for your transition.

## When the popover appears

As in driver.js, the popover of the first step shows immediately; on later steps of an animated tour it appears halfway through the slide, so it fades in while the cutout is still settling. The engine drives this through `driver.state.popover`, which is `undefined` while hidden. If you need the popover to appear only after the slide, watch `driver.state.transitioning` in a custom popover and delay your own enter animation.

## Replacing the stage animation entirely

The slide is computed by the engine and written to `driver.state.stage` every frame. A custom overlay (the `#overlay` slot) receives that rect and can render it however it likes, including with CSS transitions instead of the frame-by-frame values: set `animate: false` so the rect jumps, and add `transition: all 400ms` to your own cutout element.
