# Feature Hints

Hints are small pulsing dots (beacons) placed on elements of the page. Clicking a beacon opens a popover about its element. The reader can open hints in any order, and by default there is no overlay, so the page stays usable.

Hints come from the `driver-vue/hints` entry and use the same stylesheet as tours (see [Installation](../guide/installation)).

## A first hint

Pass the hints to `useHints`, render `<DriverHints>` and call `show()` to put the beacons on the page. Each hint has an `element` and a `popover`, like a tour step.

<HintsDemo
  prefix="hint"
  :hints="[
    { element: '#export', id: 'export', popover: { title: 'Export', description: 'Click outside or press Escape to close this popover. Got it removes the hint.' } },
    { element: '#search', id: 'name', popover: { title: 'Project name', description: 'Hints can be opened in any order.' } },
  ]"
/>

```vue
<script setup lang="ts">
import { useHints, DriverHints } from "driver-vue/hints";

const { hints, show } = useHints({
  hints: [
    {
      element: "#export-btn",
      id: "export",
      popover: { title: "Export", description: "Downloads the project as a ZIP file." },
    },
    {
      element: "#project-name",
      id: "name",
      popover: { title: "Project name", description: "Shown in the sidebar and in shared links." },
    },
  ],
});
</script>

<template>
  <button @click="show()">Show hints</button>
  <DriverHints :hints="hints" />
</template>
```

`useHints` returns the instance as `hints`, its methods (`show`, `hide`, `open`, `close`, `toggle`, `dismiss`, `restore`, `restoreAll`, `setHints`, `refresh`) and the reactive refs `isVisible`, `active`, `activeId` and `mountedIds`. It hides the beacons when the component unmounts. If you pass a ref or a getter, changes to its `hints` are applied with `setHints()`. Outside components, use `createHints(config)` from the same entry.

A hint whose element is not on the page is skipped. The next `show()` tries it again.

## Closing and dismissing

A hint popover can be closed or dismissed:

- Clicking the beacon again, clicking anywhere outside the popover, or pressing <kbd>Escape</kbd> closes the popover. The beacon stays and the hint can be opened again.
- The popover button (default text "Got it") dismisses the hint: its beacon is removed and `onDismiss` runs. A dismissed hint stays gone until `restore(id)`, `restoreAll()` or `setHints()`.

Only one popover is open at a time. Opening another hint closes the current one.

The button text is set with `buttonText`, for all hints in the config or per hint in `popover`. `popover.showButton: false` hides the button. To run your own code instead of dismissing, pass `onButtonClick`; it replaces the dismiss, so call `hints.dismiss(hint.id)` in it if the hint should also go away.

## Remembering dismissals

Dismissals are kept in memory only. To keep them across visits, give each hint a stable `id`, store the ids in `onDismiss` and leave dismissed hints out of the config:

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

Without an `id`, a hint is identified by its index in the array.

## Beacon position

A beacon sits on one of twelve points of its element's box: a `side` (`top`, `right`, `bottom`, `left`) plus an `align` (`start`, `center`, `end`). The default is `top` and `end`, the top-right corner. `offsetX` and `offsetY` move it by a number of pixels: positive values move it right and down, negative values left and up.

```ts
const hint = {
  element: "#dashboard",
  beacon: { side: "top", align: "end", offsetX: -12, offsetY: 8 },
  popover: { title: "Dashboard", description: "..." },
};
```

The `beacon` option of the config sets defaults for every hint; a hint's own `beacon` values win. The popover has its own `side` and `align` (default `bottom` and `start`), relative to the beacon.

Colors, size, the pulse animation and custom beacon or popover markup are covered in [Styling Hints](../styling/styling-hints).

## Dimming the page

With `overlay: true`, an open hint looks like a tour step: the page is dimmed, the element is cut out of the overlay and stays interactive, and the popover is placed next to the element instead of the beacon. The beacon of the open hint is hidden while its popover is shown, and the other beacons are under the overlay. Clicking the dimmed page closes the hint.

<HintsDemo
  prefix="hint-dim"
  :config="{ overlay: true, overlayOpacity: 0.5 }"
  :hints="[
    { element: '#export', id: 'export', popover: { title: 'Export', description: 'The page is dimmed while this hint is open.' } },
    { element: '#summary', id: 'summary', beacon: { side: 'left', align: 'center' }, popover: { title: 'Summary', description: 'The beacon is placed on the left edge, centered.', side: 'bottom' } },
  ]"
/>

```ts
useHints({
  overlay: true,
  overlayColor: "#000",
  overlayOpacity: 0.5,
  hints: [
    /* ... */
  ],
});
```

`overlayColor` defaults to `#000` and `overlayOpacity` to `0.7`.

## Hints and tours

Hints and tours do not need to know about each other. While a tour is running, the beacons are hidden and an open hint is closed. When the tour ends, the beacons come back.

A hint can start a tour from its button with `onButtonClick`:

```ts
const tour = useDriver({
  steps: [
    /* ... */
  ],
});

const { hints } = useHints({
  hints: [
    {
      element: "#whats-new",
      id: "whats-new",
      popover: {
        title: "New dashboard",
        description: "Want a short walkthrough?",
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

Each hints instance is independent: its hints, dismissals and overlay do not affect another instance or a running tour.

## Instance methods

```ts
const { hints } = useHints({
  /* ... */
});

hints.show(); // mount the beacons
hints.hide(); // remove the beacons and listeners; show() brings them back
hints.open("export"); // open a hint's popover
hints.close(); // close the open popover, keeping its beacon
hints.toggle("export"); // open the hint, or close it if it is open
hints.dismiss("export"); // dismiss a hint and run onDismiss
hints.restore("export"); // bring back a dismissed hint
hints.restoreAll(); // bring back every dismissed hint
hints.setHints([]); // replace the hints and clear dismissals
hints.getHints(); // the configured hints
hints.getActive(); // the hint whose popover is open, if any
hints.isVisible(); // whether the beacons are shown
hints.refresh(); // reposition after a layout change
```

All options, including `onOpen`, `popoverClass`, `popoverOffset`, the per-hint hooks and `data`, are listed in [Configuration](../guide/configuration#hints-configuration).
