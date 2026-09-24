---
"driver-vue": minor
"nuxt-driver-vue": minor
---

- Popover placement follows driver.js: the requested side is kept while it has room on its own axis, then the opposite side and the perpendicular sides are tried, so a `right` popover on a phone goes below the element instead of covering it. When no side has room the popover sits at the bottom of the viewport without an arrow.
- The arrow is re-resolved on every position update, so it turns towards the element while the popover is pinned to the viewport edge (it used to keep its old direction until the popover itself moved).
- `scrollAwayBehavior` (`"stick"`, `"close"` or a hook) and `scrollAwayOffset` decide what happens when the highlighted element is scrolled out of view; `scrollBackOnClick` scrolls it back when the pinned popover is clicked.
- Popover slot props gain `away` and `scrollBack()`; `useDriverPosition` returns `referenceHidden`; the popover gets `driver-popover-away` / `driver-popover-scroll-back` classes.
- `arrowOffsetAlong` takes an optional alignment and `ARROW_SIZE` is exported.
- The arrow color follows `--driver-popover-bg` wherever it is set, so a theme scoped to a `popoverClass` no longer leaves a white arrow. `--driver-popover-arrow-color` still overrides it.
