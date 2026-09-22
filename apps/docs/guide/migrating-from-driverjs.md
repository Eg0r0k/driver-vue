# Migrating from driver.js

driver-vue is a port of driver.js 1.8. The engine (navigation, hooks, keyboard control, scrolling, waiting for elements, skipping missing ones, hints) is the same code; what changed is that the popover, the overlay and the beacons are Vue components.

## What is identical

- **Config, steps, popover options and hooks.** `Config`, `DriveStep`, `Popover`, `DriverHook`, `HookOpts`, `State`, `Side`, `Alignment`, `AllowedButtons` have the same names and members. A tour object written for driver.js type-checks against driver-vue.
- **The `Driver` methods.** `drive`, `highlight`, `moveNext`, `movePrevious`, `moveTo`, `hasNextStep`, `hasPreviousStep`, `isFirstStep`, `isLastStep`, `getActiveIndex`, `getActiveStep`, `getActiveElement`, `getPreviousStep`, `getPreviousElement`, `getNextStep`, `isActive`, `refresh`, `getConfig`, `setConfig`, `setSteps`, `getState`, `destroy`.
- **The `driver()` factory.** `import { driver } from "driver-vue"` is an alias of `createDriver`.
- **Hook order and semantics**, including `onDestroyStarted` confirm-on-exit, `onDoneClick`, `advanceOnClick`, `waitForElement`, `skipMissingElement`, `overlayClickBehavior`.
- **Class names**, ids and ARIA attributes on the popover, the overlay, the highlighted element and `<body>` (`driver-active`, `driver-fade`, ...). driver.js themes apply unchanged.
- **The hints API**: `hints()` / `createHints()`, `HintsConfig`, `DriverHint`, `show/hide/open/close/dismiss/restore/restoreAll/setHints/getHints/getActive/isVisible/refresh`.

## What changed

| driver.js | driver-vue |
| --- | --- |
| `import "driver.js/dist/driver.css"` and `hints.css` | `import "driver-vue/style.css"` (one file, tours and hints) |
| The popover and overlay are created by the library | You render `<DriverTour />` once (and `<DriverHints :hints>` for hints) |
| `driver()` in any module | `useDriver()` in components (auto-destroy, plugin defaults, reactive refs), `createDriver()` elsewhere |
| CDN / IIFE build | Not provided |
| Positioning algorithm | Floating UI (`flip` + `shift`); the rendered side/align classes are still set |
| `onPopoverRender(popover)` always has every part | With a custom popover body, unrendered parts are `null` |
| Styling via `popoverClass` + CSS, or DOM edits in `onPopoverRender` | Also CSS variables, slots, per-step components, global component overrides, headless |

`title` and `description` are still rendered as HTML for compatibility (driver.js used `innerHTML`). Treat them as trusted content; for anything else use the `#title` / `#description` slots or a component.

## Step by step

1. Replace the package and the stylesheet import.

```diff
- import { driver } from "driver.js";
- import "driver.js/dist/driver.css";
+ import { createDriver } from "driver-vue";
+ import "driver-vue/style.css";
```

2. Render `<DriverTour />` once, in your root component or layout (and install `DriverPlugin`, or pass `:driver`).

```vue
<template>
  <RouterView />
  <DriverTour />
</template>
```

3. Keep your config. Optionally move it into `useDriver()`:

```diff
- const driverObj = driver({ showProgress: true, steps });
- driverObj.drive();
+ const { drive } = useDriver({ showProgress: true, steps });
+ drive();
```

4. If you used `onPopoverRender` to add buttons, it still works. Consider the `#footer` / `#next` slots instead, see [Custom Components](../styling/custom-components).

5. If you used `driver.js/hints`, replace `hints()` with `useHints()` and render `<DriverHints :hints="hints" />` once.

## Positioning notes

The popover keeps the configured `side` and `align` when they fit and flips to the opposite side otherwise, then shifts along the edge to stay in the viewport; the rendered values are exposed as `driver-popover-side-*` / `driver-popover-align-*` classes and `data-side` / `data-align` attributes. Pixel positions differ slightly from driver.js. The popover follows the element on scroll and resize through Floating UI's `autoUpdate` and on `driver.refresh()`.

## New options

- `easing` – the stage slide's easing function.
- `components: { popover, overlay }` – global component overrides.
- `popover.component` and `popover.props` – a component per step.
- `teleportTo` – where `<DriverTour>` renders (default `body`).
- `zIndex` – base z-index (default `10000`).
- `driver.state` – the reactive state; see [Headless](../styling/headless).
