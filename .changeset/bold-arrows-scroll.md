---
"driver-vue": minor
"nuxt-driver-vue": minor
---

- `showArrow` option on the config, on a step's `popover` and on hints to turn the popover arrow off; the `#arrow` slot receives `arrowSide`.
- `showButtons: []` on a tour hides every button (driver.js showed all of them).
- The popover stays inside the viewport when its element scrolls away, and the arrow moves to the edge facing the element.
- Hint beacons and popovers are positioned in document coordinates, so they scroll with the page natively; opening a hint no longer scrolls the page.
- `driver-interactive` class re-enables pointer events on your own UI while a tour runs; `DriverBoxOverlay`, `stageClass`, `overlayClass`.
- `useDriver()` provides its driver to its subtree, so a `<DriverTour />` in the same component renders it.
