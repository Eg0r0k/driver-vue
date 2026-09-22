# Theming

driver-vue keeps the driver.js class names and turns every hard-coded value of the driver.js stylesheet into a CSS custom property. So there are three levels of theming before you touch a component:

1. Override the **CSS variables**, globally or scoped to a `popoverClass`.
2. Style the **class names**, exactly as with driver.js.
3. Restyle the **transitions** and the **stage** (the box tracking the cutout).

Beyond that, [Custom Components](../styling/custom-components) replaces markup with slots and components, and [Headless](../styling/headless) drops the default rendering entirely.

## CSS variables

All variables live on `:root` in `driver-vue/style.css`. Redefine them on `:root` for a global theme, or on `.driver-popover.my-theme` and pass `popoverClass: "my-theme"` (globally or per step) for a scoped one.

<ThemeDemo />

```css
.driver-popover.docs-dark-theme {
  --driver-popover-bg: #18181b;
  --driver-popover-color: #f4f4f5;
  --driver-popover-radius: 12px;
  --driver-popover-padding: 20px;
  --driver-popover-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  --driver-popover-btn-bg: #4f46e5;
  --driver-popover-btn-color: #fff;
  --driver-popover-btn-radius: 8px;
}
```

```ts
useDriver({ popoverClass: "docs-dark-theme" });
```

The full list, with the driver.js defaults:

```css
:root {
  --driver-z-index: 10000;
  --driver-animation-duration: 400ms; /* set from config.duration while a tour runs */
  --driver-animation-easing: ease-in-out;

  --driver-popover-bg: #fff;
  --driver-popover-color: #2d2d2d;
  --driver-popover-radius: 5px;
  --driver-popover-padding: 15px;
  --driver-popover-shadow: 0 1px 10px #0006;
  --driver-popover-min-width: 250px;
  --driver-popover-max-width: 300px;
  --driver-popover-font-family: "Helvetica Neue", Inter, ui-sans-serif, "Apple Color Emoji", Helvetica, Arial, sans-serif;
  --driver-popover-title-size: 19px;
  --driver-popover-title-weight: 700;
  --driver-popover-description-size: 14px;
  --driver-popover-progress-color: #727272;
  --driver-popover-close-color: #d2d2d2;
  --driver-popover-close-hover-color: #2d2d2d;

  --driver-popover-btn-bg: #fff;
  --driver-popover-btn-hover-bg: #f7f7f7;
  --driver-popover-btn-color: #2d2d2d;
  --driver-popover-btn-border: 1px solid #ccc;
  --driver-popover-btn-radius: 3px;
  --driver-popover-btn-font-size: 12px;

  --driver-popover-arrow-size: 5px;
  --driver-popover-arrow-color: var(--driver-popover-bg);

  --driver-hint-size: 24px;
  --driver-hint-color: #818cf8;
  --driver-hint-animation-duration: 2s;
}
```

The overlay color and opacity come from `overlayColor` / `overlayOpacity` in the config (see [Styling Overlay](../styling/styling-overlay)).

## Class names

The rendered DOM carries the driver.js classes, so a driver.js theme applies unchanged. Set `popoverClass` globally or per step to scope your rules.

```css
/* The popover wrapper */
.driver-popover {}

/* Arrow pointing at the highlighted element */
.driver-popover-arrow {}

/* Rendered side and alignment, after flipping to fit the viewport. The same
   values are also exposed as data-side / data-align attributes. */
.driver-popover-side-top {}
.driver-popover-side-right {}
.driver-popover-side-bottom {}
.driver-popover-side-left {}
.driver-popover-align-start {}
.driver-popover-align-center {}
.driver-popover-align-end {}

/* Title and description */
.driver-popover-title {}
.driver-popover-description {}

/* Close button in the top right corner */
.driver-popover-close-btn {}

/* Footer with progress and navigation */
.driver-popover-footer {}
.driver-popover-progress-text {}
.driver-popover-navigation-btns {}
.driver-popover-prev-btn {}
.driver-popover-next-btn {}

/* Shared look of the footer buttons; add it to your own buttons for the
   default styling. */
.driver-popover-footer-btn {}

/* Added to the next button on the last step */
.driver-popover-next-btn.driver-popover-done-btn {}

/* Added to disabled buttons */
.driver-popover-btn-disabled {}
```

The `<body>` and the page carry:

```css
.driver-active {} /* a tour or highlight is active */
.driver-fade {} /* ... and animated */
.driver-simple {} /* ... and not animated */
.driver-no-scroll {} /* allowScroll: false */

.driver-overlay {} /* the SVG dim */
.driver-overlay-path {} /* its path; receives clicks */
.driver-stage {} /* the box tracking the cutout, see below */

.driver-active-element {} /* the highlighted element */
.driver-active-element-parent {} /* its parent */
.driver-no-interaction {} /* disableActiveInteraction */
```

## Transitions

The overlay and the popover are wrapped in Vue `<Transition>`s named `driver-overlay` and `driver-popover`. The default stylesheet fades them in over `--driver-animation-duration` when the tour is animated (`.driver-fade`). Override the standard Vue classes to change the animation, for example a slide-up:

```css
.driver-popover-enter-active {
  transition: opacity 300ms ease-out, transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.driver-popover-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
```

The popover remounts on every step, so the enter transition plays per step. See [Highlight Animation](../styling/highlight-animation) for a live example and for the stage animation.

## The stage

`.driver-stage` is an empty, non-interactive `div` positioned exactly over the cutout (element box plus `stagePadding`, with `stageRadius`). It has no visual by default. Give it an outline, a glow or a pulse:

```css
.driver-stage {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.9), 0 0 24px 6px rgba(99, 102, 241, 0.5);
}

/* Quieter while the cutout slides between elements */
.driver-stage[data-transitioning] {
  box-shadow: none;
}
```

Its rect is also exposed as CSS variables for pseudo-elements: `--driver-stage-x`, `--driver-stage-y`, `--driver-stage-width`, `--driver-stage-height`, `--driver-stage-radius`. The `#stage` slot of `<DriverTour>` renders inside it. See [Highlight Animation](../styling/highlight-animation).

## Custom font

The popover text uses `--driver-popover-font-family`. It is inherited, so set it anywhere above the popover:

```css
:root {
  --driver-popover-font-family: "Inter", sans-serif;
}
```

## Modifying the popover DOM

The `onPopoverRender` hook of driver.js still works: it runs once the popover is in the DOM with references to its parts. With the default popover every part is present; with a custom body, parts you do not render are `null`.

```ts
useDriver({
  onPopoverRender: (popover, { config, state }) => {
    const button = document.createElement("button");
    button.className = "driver-popover-footer-btn";
    button.innerText = "Go to first";
    popover.footerButtons?.prepend(button);
    button.addEventListener("click", () => driver.drive(0));
  },
});
```

In Vue, prefer the slots: [Custom Components](../styling/custom-components).

## Styling hints

Hint popovers are regular popovers, so everything above applies. The beacons read `--driver-hint-size` and `--driver-hint-color`, settable globally or scoped to a `beacon.className`. See [Styling Hints](../styling/styling-hints).
