# Highlight Animation

Moving from one step to the next animates the highlight in three places, and each can be changed on its own:

- the stage slide: the cutout moves from one element to the next, timed by `duration` and `easing`;
- the stage box: `.driver-stage`, an empty element that follows the cutout and can carry any decoration;
- the transitions: Vue `<Transition>` classes on the overlay and the popover.

The demo below changes all three: a custom easing, an outline on the stage box, a slide-up for the popover, and a step number rendered in the `#stage` slot.

<GlowStageDemo />

## Duration and easing

`duration` (ms, default `400`) is the length of the slide. It also sets the `--driver-animation-duration` variable on `<body>`, which the default fades use. `easing` is a function from normalized time to normalized progress; the default is driver.js's ease-in-out quad.

The demo uses an ease-out cubic: the cutout starts fast and slows down as it reaches the next element.

```ts
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

useDriver({
  duration: 500,
  easing: easeOutCubic,
});
```

Any `(t: number) => number` with `f(0) === 0` and `f(1) === 1` works:

```ts
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // the default
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const linear = (t: number) => t;
```

An easing may overshoot, returning values above `1` before it settles. The cutout then passes the element and comes back. Keep the duration short if you use one.

```ts
const easeOutBack = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
```

`animate: false` turns off the slide and the fades; the cutout and the popover then jump between steps. See [Animated tour](../examples/animated-tour).

## The stage box

`.driver-stage` covers the cutout (the element box plus `stagePadding`, with `stageRadius` corners). It ignores the pointer and has no visual by default. While the slide runs it carries the `data-transitioning` attribute. The demo draws an outline:

```css
.driver-stage {
  box-shadow: 0 0 0 2px #3866e8;
}

.driver-stage[data-transitioning] {
  box-shadow: 0 0 0 1px #3866e8;
}
```

The rect is also set as CSS variables on the element, for pseudo-elements and animations that need the numbers: `--driver-stage-x`, `--driver-stage-y`, `--driver-stage-width`, `--driver-stage-height` and `--driver-stage-radius`.

Content for the stage box goes in the `#stage` slot of `<DriverTour>`; the step number in the demo is rendered there. The slot and its props are described in [Custom components](./custom-components#the-stage).

### Per-tour classes

Rules on `.driver-stage` apply to every tour. To style one tour only, `stageClass` adds a class to the stage box and `overlayClass` to the overlay root. The demo passes `stageClass: "docs-stage-ring"`:

```ts
useDriver({ stageClass: "ring", steps });
```

```css
.driver-stage.ring {
  box-shadow: 0 0 0 2px #3866e8;
}
```

`data-transitioning` disappears when the stage arrives, so an arrival effect can start then:

```css
.driver-stage.ring::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 2px solid #3866e8;
  border-radius: inherit;
  animation: ripple 900ms ease-out forwards;
}

.driver-stage.ring[data-transitioning]::after {
  animation: none;
  opacity: 0;
}

@keyframes ripple {
  to {
    inset: -16px;
    opacity: 0;
  }
}
```

## Popover and overlay transitions

The popover is wrapped in `<Transition name="driver-popover" appear>` and remounts on every step, so its enter transition plays on each step. The overlay is wrapped in `<Transition name="driver-overlay" appear>` and enters once per tour. Override the Vue classes to change them:

```css
.driver-popover-enter-active {
  transition:
    opacity 300ms ease-out,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.driver-popover-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.driver-overlay-enter-active {
  transition: opacity 600ms ease;
}

.driver-overlay-enter-from {
  opacity: 0;
}
```

The default rules apply only under `.driver-fade` (a tour with `animate` on) and are turned off for `prefers-reduced-motion: reduce`. Rules without the `.driver-fade` prefix apply whatever `animate` is. The transition classes are on the same element as `popoverClass`, so `.driver-popover.my-class.driver-popover-enter-active` limits a transition to one tour; the demo does this.

The popover is positioned with `left` and `top`, so `transform` is free for your transition. The exception is a centered popover (a step without an element), which uses `transform: translate(-50%, -50%)`.

## When the popover appears

As in driver.js, the popover of the first step shows immediately. On later steps of an animated tour it appears halfway through the slide, so it fades in while the cutout is still moving. The engine does this through `driver.state.popover`, which is `undefined` while the popover is hidden. To show a custom popover only after the slide, watch `driver.state.transitioning` and delay your own enter animation.

## Moving the box with CSS

The default overlay is an SVG path, which only the engine can animate. `DriverBoxOverlay` is an alternative overlay whose cutout is an element with a large `box-shadow`. Combine it with `animate: false`: the engine stops interpolating, the rect jumps to the next element, and CSS transitions move both the cutout and `.driver-stage` there, with any timing function CSS supports:

```ts
import { DriverBoxOverlay } from "driver-vue";

useDriver({
  animate: false,
  duration: 600,
  overlayClass: "spring",
  stageClass: "spring",
  components: { overlay: DriverBoxOverlay },
  steps,
});
```

```css
.spring {
  --driver-animation-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

The cutout (`.driver-box-overlay-cutout`) and the stage box both read `--driver-animation-duration` (set from `duration`) and `--driver-animation-easing`. With `animate: true` the engine moves the box overlay frame by frame like the SVG one, and the CSS transition is off.

The Nuxt playground's "Highlight box animation" page combines these options with live controls.

## Replacing the stage animation

The engine computes the slide and writes it to `driver.state.stage` on every frame. A [custom overlay](./custom-components#the-overlay) receives that rect and can draw it any way it likes. To animate with CSS instead of the per-frame values, set `animate: false` so the rect jumps, and put a `transition` on your own cutout element. For example, a `clip-path: polygon(evenodd, ...)` on a full-screen layer with `backdrop-filter: blur()` gives a blurred overlay with a sharp cutout, and `clip-path` can be transitioned.
