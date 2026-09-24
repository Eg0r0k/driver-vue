# nuxt-driver-vue

## 0.3.0

### Minor Changes

- 558e8d3: - Popover placement follows driver.js: the requested side is kept while it has room on its own axis, then the opposite side and the perpendicular sides are tried, so a `right` popover on a phone goes below the element instead of covering it. When no side has room the popover sits at the bottom of the viewport without an arrow.
  - The arrow is re-resolved on every position update, so it turns towards the element while the popover is pinned to the viewport edge (it used to keep its old direction until the popover itself moved).
  - `scrollAwayBehavior` (`"stick"`, `"close"` or a hook) and `scrollAwayOffset` decide what happens when the highlighted element is scrolled out of view; `scrollBackOnClick` scrolls it back when the pinned popover is clicked.
  - Popover slot props gain `away` and `scrollBack()`; `useDriverPosition` returns `referenceHidden`; the popover gets `driver-popover-away` / `driver-popover-scroll-back` classes.
  - `arrowOffsetAlong` takes an optional alignment and `ARROW_SIZE` is exported.
  - The arrow color follows `--driver-popover-bg` wherever it is set, so a theme scoped to a `popoverClass` no longer leaves a white arrow. `--driver-popover-arrow-color` still overrides it.

### Patch Changes

- Updated dependencies [558e8d3]
  - driver-vue@0.3.0

## 0.2.0

### Minor Changes

- 53b6d13: - `showArrow` option on the config, on a step's `popover` and on hints to turn the popover arrow off; the `#arrow` slot receives `arrowSide`.
  - `showButtons: []` on a tour hides every button (driver.js showed all of them).
  - The popover stays inside the viewport when its element scrolls away, and the arrow moves to the edge facing the element.
  - Hint beacons and popovers are positioned in document coordinates, so they scroll with the page natively; opening a hint no longer scrolls the page.
  - `driver-interactive` class re-enables pointer events on your own UI while a tour runs; `DriverBoxOverlay`, `stageClass`, `overlayClass`.
  - `useDriver()` provides its driver to its subtree, so a `<DriverTour />` in the same component renders it.

### Patch Changes

- Updated dependencies [53b6d13]
  - driver-vue@0.2.0
