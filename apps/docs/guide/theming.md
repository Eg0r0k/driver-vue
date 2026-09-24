# Theming

driver-vue keeps the driver.js class names and turns the fixed values of the driver.js stylesheet into CSS custom properties. This page lists both. How to use them is shown in [Styling popover](../styling/styling-popover), [Styling overlay](../styling/styling-overlay) and [Styling hints](../styling/styling-hints); the stage box and the transitions are covered in [Highlight animation](../styling/highlight-animation).

## CSS variables

All variables are defined on `:root` in `driver-vue/style.css`. Set them on `:root` for a global theme, or on `.driver-popover.my-theme` together with `popoverClass: "my-theme"` (in the config or per step) for a scoped one:

```css
:root {
  --driver-popover-font-family: "Inter", sans-serif;
}

.driver-popover.my-theme {
  --driver-popover-bg: #18181b;
  --driver-popover-color: #f4f4f5;
}
```

The arrow takes the popover background unless `--driver-popover-arrow-color` is set.

The full list, with the driver.js defaults:

```css
:root {
  --driver-z-index: 10000; /* stylesheet defaults and hint beacons; see the note below */
  --driver-animation-duration: 400ms; /* set on <body> from config.duration while a tour runs */
  --driver-animation-easing: ease-in-out; /* CSS transitions of DriverBoxOverlay and of the stage with animate: false */

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

  --driver-popover-arrow-size: 5px; /* hint popovers: 7px */
  /* --driver-popover-arrow-color: unset, the arrow uses --driver-popover-bg */

  --driver-hint-size: 24px;
  --driver-hint-color: #818cf8;
  --driver-hint-animation-duration: 2s;
}
```

The overlay color and opacity are not variables; they come from `overlayColor` and `overlayOpacity` in the config. The same goes for the z-index of a tour: the overlay, the stage and the popover get it as an inline style from `zIndex` in the config (default `10000`, the stage at +1, the popover at +2), so set it there; `--driver-z-index` does not change it.

## Class names

The rendered DOM carries the driver.js classes, so a driver.js theme applies unchanged.

The popover:

```css
.driver-popover {} /* the wrapper; also carries popoverClass */

/* Rendered side and alignment, after the popover moved to fit the viewport.
   Also exposed as data-side / data-align attributes. */
.driver-popover-side-top {}
.driver-popover-side-right {}
.driver-popover-side-bottom {}
.driver-popover-side-left {}
.driver-popover-side-over {} /* centered, no element */
.driver-popover-align-start {}
.driver-popover-align-center {}
.driver-popover-align-end {}

.driver-popover-away {} /* the element is scrolled out of the viewport */
.driver-popover-scroll-back {} /* ... and scrollBackOnClick is on; a click scrolls back */

.driver-popover-arrow {}
.driver-popover-arrow-side-top {} /* also -right, -bottom, -left: the edge the arrow is on */
.driver-popover-arrow-none {} /* nothing to point at; hidden */

.driver-popover-close-btn {}
.driver-popover-title {}
.driver-popover-description {}

.driver-popover-footer {}
.driver-popover-progress-text {}
.driver-popover-navigation-btns {}
.driver-popover-footer-btn {} /* shared look of the footer buttons */
.driver-popover-prev-btn {}
.driver-popover-next-btn {}
.driver-popover-done-btn {} /* added to the next button on the last step */
.driver-popover-btn-disabled {} /* added to disabled buttons */
```

The page and the highlighted element:

```css
/* On <body> */
.driver-active {} /* a tour or highlight is running */
.driver-fade {} /* ... with animate on */
.driver-simple {} /* ... with animate off */
.driver-no-scroll {} /* allowScroll: false */

/* On the highlighted element and its parent */
.driver-active-element {}
.driver-no-interaction {} /* disableActiveInteraction */
.driver-active-element-parent {}
.driver-active-element-parent-no-scroll {} /* the parent scrolls; its scrolling is blocked */

/* Your own elements that must stay clickable during a tour, see Headless */
.driver-interactive {}
```

The overlay and the stage:

```css
.driver-overlay {} /* the full-screen SVG; also carries overlayClass */
.driver-overlay-path {} /* the dimmed area; the only part receiving clicks */
.driver-box-overlay {} /* DriverBoxOverlay root (together with .driver-overlay) */
.driver-box-overlay-cutout {} /* DriverBoxOverlay cutout */
.driver-stage {} /* the box over the cutout; also carries stageClass */
```

Hints:

```css
.driver-hint {} /* the beacon button */
.driver-hint[aria-expanded="true"] {} /* its hint is open */
.driver-hint-hidden {} /* the element is scrolled out of view */
.driver-hint-no-animation {} /* animate: false */
.driver-hint-pulse {} /* the pulsing ring */
.driver-hint-dot {} /* the dot */
.driver-hint-overlay {} /* the dim with overlay: true */
.driver-hint-popover {} /* added to a hint's popover */
```

The Vue transitions are named `driver-popover`, `driver-overlay` and `driver-hint-overlay`, so their classes are `driver-popover-enter-active`, `driver-popover-enter-from` and so on. See [Highlight animation](../styling/highlight-animation#popover-and-overlay-transitions).
