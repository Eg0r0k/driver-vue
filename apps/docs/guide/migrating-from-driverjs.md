# Migrating from driver.js

driver-vue is a port of driver.js 1.8. The engine (navigation, hooks, keyboard control, scrolling, waiting for elements, skipping missing ones, hints) is the same code. The difference is that the popover, the overlay and the hint beacons are Vue components.

## What is identical

- `Config`, `DriveStep`, `Popover`, `DriverHook`, `HookOpts`, `State`, `Side`, `Alignment` and `AllowedButtons` have the same names and members. A tour object written for driver.js type-checks against driver-vue.
- The `Driver` methods: `drive`, `highlight`, `moveNext`, `movePrevious`, `moveTo`, `hasNextStep`, `hasPreviousStep`, `isFirstStep`, `isLastStep`, `getActiveIndex`, `getActiveStep`, `getActiveElement`, `getPreviousStep`, `getPreviousElement`, `getNextStep`, `isActive`, `refresh`, `getConfig`, `setConfig`, `setSteps`, `getState`, `destroy`.
- The `driver()` factory: `import { driver } from "driver-vue"` is an alias of `createDriver`.
- The order and meaning of the hooks, including `onDestroyStarted`, `onDoneClick`, `advanceOnClick`, `waitForElement`, `skipMissingElement` and `overlayClickBehavior`.
- The class names, ids and ARIA attributes on the popover, the overlay, the highlighted element and `<body>` (`driver-active`, `driver-fade`, ...), so driver.js themes still apply.
- The hints API: `hints()` / `createHints()`, `HintsConfig`, `DriverHint`, and the `show`, `hide`, `open`, `close`, `dismiss`, `restore`, `restoreAll`, `setHints`, `getHints`, `getActive`, `isVisible` and `refresh` methods.

## What changed

| driver.js | driver-vue |
| --- | --- |
| `import "driver.js/dist/driver.css"` and `hints.css` | `import "driver-vue/style.css"` (one file for tours and hints) |
| The library creates the popover and the overlay | You render `<DriverTour />` (and `<DriverHints :hints>` for hints) |
| `driver()` in any module | `useDriver()` in components (destroyed on unmount, plugin defaults, reactive refs), `createDriver()` elsewhere |
| CDN / IIFE build | Not provided |
| Own positioning code | Floating UI with the driver.js side rules, see [Positioning](#positioning) |
| `onPopoverRender(popover)` always gets every part | With a custom popover body, parts you do not render are `null` |
| Styling with `popoverClass` and CSS, or DOM edits in `onPopoverRender` | The same, plus CSS variables, slots, per-step components, global component overrides and headless rendering |

`title` and `description` are still rendered as HTML, as driver.js did with `innerHTML`. Pass only trusted content there; for anything else use the `#title` / `#description` slots or a component.

## Step by step

1. Replace the package and the stylesheet import.

```diff
- import { driver } from "driver.js";
- import "driver.js/dist/driver.css";
+ import { useDriver, DriverTour } from "driver-vue";
+ import "driver-vue/style.css";
```

2. In a component, create the driver with `useDriver()` and render it with a `<DriverTour />` in the same component. The config stays the same.

```diff
- const driverObj = driver({ showProgress: true, steps });
- driverObj.drive();
+ const { drive } = useDriver({ showProgress: true, steps });
+ drive();
```

```vue
<template>
  <!-- ... -->
  <DriverTour />
</template>
```

A driver created with `createDriver()` in a plain module is rendered with `<DriverTour :driver="driverObj" />`. [Installation](./installation) also shows a single `<DriverTour />` in the root component with the app-wide driver.

3. If you used `onPopoverRender` to add buttons, it still works. The `#footer` and `#next` slots are an alternative, see [Custom components](../styling/custom-components).

4. If you used `driver.js/hints`, replace `hints()` with `useHints()` from `driver-vue/hints` and render `<DriverHints :hints="hints" />` once.

## Positioning

The popover is placed on the requested `side` when the space between the element and the viewport edge on that side holds it. Otherwise it tries the opposite side, then the perpendicular sides (for left and right: bottom, then top; for top and bottom: left, then right). Only that one axis is checked, so a popover on the right of an element that has scrolled above the viewport stays on the right. When no side has room, for example with an element taller than a phone screen, the popover is centered at the bottom of the viewport and the arrow is hidden.

The popover is shifted to stay inside the viewport. While its element scrolls out of view, the popover sticks to the nearest edge and the arrow moves to the edge that faces the element; `scrollAwayBehavior` changes this (see [Element out of view](../examples/scroll-away)).

The rendered side and alignment are set as `driver-popover-side-*` / `driver-popover-align-*` classes and `data-side` / `data-align` attributes. Pixel positions differ slightly from driver.js. The popover follows the element on scroll and resize, and on `driver.refresh()`.

## New options

| Option | Description |
| --- | --- |
| `showArrow` | Show or hide the popover arrow, for the tour or per step |
| `easing` | Easing function of the stage animation between steps |
| `stageClass`, `overlayClass` | Classes added to the stage and the overlay |
| `components: { popover, overlay }` | Components used for every step |
| `popover.component`, `popover.props` | A component for one step |
| `teleportTo` | Where `<DriverTour>` renders (default `body`) |
| `zIndex` | Base z-index (default `10000`) |
| `scrollAwayBehavior`, `scrollAwayOffset`, `scrollBackOnClick` | What happens when the highlighted element leaves the viewport |
| `driver.state` | The reactive state, see [Headless](../styling/headless) |

All options are listed in [Configuration](./configuration).
