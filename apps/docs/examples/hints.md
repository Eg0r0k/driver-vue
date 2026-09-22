# Feature Hints

Hints are pulsing beacons that sit on the page. The user clicks one to open a popover, in any order, with no overlay and nothing blocked, so the page stays interactive.

They ship as their own entry so tour-only apps never load them; the stylesheet is shared with tours:

```ts
import { useHints, DriverHints } from "driver-vue/hints";
import "driver-vue/style.css";
```

Each hint points at an element and describes it with the same popover you know from tours. The demo below also turns on the optional overlay, which spotlights the element while its hint is open:

<!-- TODO(hints-demo): basic hints demo with overlay: true, overlayOpacity: 0.5, two hints (#hint-export, #hint-summary with beacon side left/center and popover side bottom) -->

```vue
<script setup lang="ts">
import { useHints, DriverHints } from "driver-vue/hints";

const { hints, show } = useHints({
  overlay: true,
  overlayOpacity: 0.5,
  hints: [
    {
      element: "#export-btn",
      id: "export",
      popover: {
        title: "Export your data",
        description: "Download this report as CSV or PDF.",
      },
    },
    {
      element: "#summary",
      id: "summary",
      beacon: { side: "left", align: "center" },
      popover: {
        title: "Auto-generated summary",
        description: "This paragraph is written for you from the quarter's numbers.",
        side: "bottom",
      },
    },
  ],
});
</script>

<template>
  <button @click="show()">Show hints</button>
  <DriverHints :hints="hints" />
</template>
```

`useHints` creates the instance, hides it when the component unmounts, and returns `hints` (the instance) plus its methods and reactive refs (`isVisible`, `activeHint`). `createHints` is the plain factory for use outside components.

## Closing vs. dismissing

The two are deliberately different:

- **Closing**: clicking the beacon again, clicking anywhere outside, or pressing <kbd>Escape</kbd> closes the popover. The beacon stays, and the hint can be opened again.
- **Dismissing**: clicking the _Got it_ button removes the beacon entirely and fires `onDismiss`. The hint is gone for the session. Provide `onButtonClick` to take over the button and decide yourself, the same way `onNextClick` takes over a tour's next button.

Only one hint popover is open at a time; opening another swaps it.

## Remembering dismissals

driver-vue keeps dismissals in memory for the session and stays out of the storage business. `onDismiss` with stable `id`s is the hook, and storage is yours:

```ts
const dismissed = new Set<string>(JSON.parse(localStorage.getItem("hints") ?? "[]"));

const { hints, show } = useHints({
  hints: allHints.filter(hint => !dismissed.has(hint.id!)),
  onDismiss: (element, hint) => {
    dismissed.add(hint.id!);
    localStorage.setItem("hints", JSON.stringify([...dismissed]));
  },
});
```

## Beacon placement and styling

A beacon sits on one of twelve anchor points of its element's box: a `side` (`top`, `right`, `bottom`, `left`) plus an `align` (`start`, `center`, `end`). The default is the top-right corner. Set `animate: false` for a static dot; the pulse also pauses automatically for users who prefer reduced motion.

When an anchor point lands a little off, nudge the beacon in pixels with `offsetX` and `offsetY`. Positive `offsetX` moves it right and negative left; positive `offsetY` moves it down and negative up:

```ts
const hint = {
  element: "#dashboard",
  beacon: { side: "top", align: "end", offsetX: -12, offsetY: 8 },
};
```

Size and colour come from CSS variables:

```css
.driver-hint {
  --driver-hint-size: 32px;
  --driver-hint-color: #e11d48;
}
```

See [Styling Hints](../styling/styling-hints) for more, including the `#beacon` and `#popover` slots.

## Dimming the page

Pass `overlay: true` to dim the page while a hint is open. The hint reads exactly like a tour step: the element is cut out of the dim and stays interactive, the popover anchors to the element rather than the beacon, and the beacon itself steps aside while its popover is up. Everything else, including the other beacons, sits under the overlay; clicking the dimmed page closes the hint like any outside click.

```ts
useHints({
  overlay: true,
  overlayColor: "#000",
  overlayOpacity: 0.5,
  hints: [/* ... */],
});
```

## Using hints alongside a tour

Hints and tours coexist without any wiring: while a tour is running, the beacons hide and any open hint closes; when the tour ends, the beacons return on their own. A common pattern is a hint whose button launches the tour, using `onButtonClick` to take over the button:

```ts
const tour = useDriver({ steps: [/* ... */] });

const { hints } = useHints({
  hints: [
    {
      element: "#whats-new",
      id: "whats-new",
      popover: {
        title: "New dashboard",
        description: "Want a quick walkthrough?",
        buttonText: "Take the tour",
        onButtonClick: (element, hint, { hints: instance }) => {
          instance.close();
          tour.drive();
        },
      },
    },
  ],
});
```

Since hint popovers are regular popovers, `onPopoverRender` and the popover slots work too.

## Options

Configuration passed to `useHints()` / `createHints()`:

```ts
useHints({
  // Array of hints, documented below.
  hints: [],

  // Defaults applied to every hint's beacon; a hint's own values win.
  beacon: { side: "top", align: "end", offsetX: 0, offsetY: 0, animate: true, className: "" },

  // Text of the dismiss button. Defaults to "Got it".
  buttonText: "Got it",

  // Class and offset for the hint popovers, same meaning as in tours.
  popoverClass: "my-theme",
  popoverOffset: 10,

  // Dim the page while a hint is open. Off by default.
  overlay: false,
  overlayColor: "#000",
  overlayOpacity: 0.7,

  // Called when a hint popover is opened / a hint is dismissed.
  onOpen: (element, hint, { config, hints }) => {},
  onDismiss: (element, hint, { config, hints }) => {},

  // Runs instead of dismissing when the button is clicked. Call
  // hints.dismiss(hint.id) yourself to also remove the hint.
  onButtonClick: (element, hint, { config, hints }) => {},
});
```

Each hint in the `hints` array:

```ts
const hint = {
  // Selector, element, or a function returning one. A hint whose element
  // is missing is skipped and picked up again on the next show().
  element: "#export-btn",

  // Stable identity, used by open/dismiss/restore and in the hooks.
  // Defaults to the hint's index.
  id: "export",

  // Where the beacon sits on the element's box, and how it looks.
  beacon: { side: "top", align: "end", offsetX: 0, offsetY: 0, animate: true, className: "" },

  popover: {
    title: "Export your data",
    description: "Download this report as CSV or PDF.",
    side: "bottom",
    align: "start",
    popoverClass: "my-theme",

    // The dismiss button; hide it for popovers you dismiss programmatically.
    showButton: true,
    buttonText: "Got it",

    // Overrides the instance-level onButtonClick for this hint.
    onButtonClick: (element, hint, { config, hints }) => {},

    onPopoverRender: (popover, { hint, hints }) => {},
  },

  // Hint-level hooks, taking precedence over the global ones.
  onOpen: (element, hint, opts) => {},
  onDismiss: (element, hint, opts) => {},

  // Anything you want to carry along; available wherever the hint is.
  data: {},
};
```

Methods on the instance:

```ts
const { hints } = useHints({ /* ... */ });

hints.show(); // mount the beacons
hints.hide(); // remove beacons and listeners; show() brings them back
hints.open("export"); // open a hint's popover programmatically
hints.close(); // close the open popover, keeping its beacon
hints.dismiss("export"); // dismiss a hint, firing onDismiss
hints.restore("export"); // bring a dismissed hint back
hints.restoreAll(); // bring every dismissed hint back
hints.setHints([/* ... */]); // replace the hints; resets dismissals
hints.getHints(); // the configured hints
hints.getActive(); // the hint whose popover is open, if any
hints.isVisible(); // whether the beacons are currently shown
hints.refresh(); // reposition after layout changes
```

> Like drivers, each hints instance is independent: its hints, dismissals and overlay never affect another instance or a running tour.
