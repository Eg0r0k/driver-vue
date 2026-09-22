# Styling Hints

Everything about a hint can be customized: the beacon's color, size and animation through CSS variables, the popover through the same theming that tours use, and both through slots on `<DriverHints>`. If you have not read the [Hints example](../examples/hints) yet, start there.

## Dimming the page

With `overlay: true` an open hint reads like a tour step: the element is spotlighted and stays interactive, the popover frames the element (the beacon steps aside while it is up), and the other beacons wait under the overlay. Clicking the dimmed page closes the hint.

<HintsDemo
  prefix="hint-overlay"
  :config="{ overlay: true, overlayOpacity: 0.5 }"
  :hints="[
    { element: '#export', popover: { title: 'Export', description: 'The page dims and the element is spotlighted while the hint is open.' } },
    { element: '#search', beacon: { side: 'right', align: 'center' }, popover: { title: 'Search', description: 'Filter the report by any term.' } },
  ]"
/>

```ts
const { hints, show } = useHints({
  overlay: true,
  overlayOpacity: 0.5,
  hints: [/* ... */],
});
```

## Beacon color and size

Beacons read two CSS variables. Set them globally on `.driver-hint`, or give individual beacons a `className` and scope the variables to it:

<HintsDemo
  prefix="hint-styled"
  :hints="[
    { element: '#export', beacon: { className: 'docs-hint-rose' }, popover: { title: 'A rose beacon', description: 'Styled through beacon.className and the CSS variables.' } },
    { element: '#summary', beacon: { className: 'docs-hint-large', side: 'left', align: 'center' }, popover: { title: 'A large beacon', description: 'Only --driver-hint-size changed.' } },
  ]"
/>

```css
/* All beacons */
.driver-hint {
  --driver-hint-color: #e11d48;
  --driver-hint-size: 28px;
}

/* Only beacons carrying a class */
.my-special-hint {
  --driver-hint-color: #059669;
}
```

```ts
useHints({
  hints: [
    {
      element: "#export-btn",
      beacon: { className: "my-special-hint" },
      popover: { title: "A rose beacon", description: "..." },
    },
  ],
});
```

## Static beacons

Set `animate: false` on a hint (or on the instance-level `beacon` defaults) for a still dot without the pulse. Users who prefer reduced motion get the still dot automatically.

<HintsDemo
  prefix="hint-static"
  :config="{ beacon: { animate: false } }"
  :hints="[
    { element: '#export', popover: { title: 'No pulse', description: 'A calm beacon for busy screens.' } },
    { element: '#share', popover: { title: 'Still static', description: 'The instance-level default applies to every hint.' } },
  ]"
/>

```ts
useHints({
  // Applies to every hint; a hint's own beacon config wins.
  beacon: { animate: false },
  hints: [/* ... */],
});
```

## Custom button text

The dismiss button says _Got it_ by default. Change it for all hints with `buttonText`, per hint through the popover, or hide it with `showButton: false` for hints you dismiss from code.

<HintsDemo
  prefix="hint-text"
  :config="{ buttonText: 'Thanks, understood' }"
  :hints="[
    { element: '#export', popover: { title: 'Instance text', description: 'The dismiss button reads the instance buttonText.' } },
    { element: '#share', popover: { title: 'Hint text', description: 'This hint overrides it.', buttonText: 'Got it, thanks' } },
  ]"
/>

```ts
useHints({
  buttonText: "Thanks, understood",
  hints: [
    {
      element: "#share-btn",
      popover: { title: "No button at all", description: "...", showButton: false },
    },
  ],
});
```

## Theming the popover

Hint popovers are regular popovers (with an extra `driver-hint-popover` class and a larger arrow), so `popoverClass`, the CSS variables and the [popover styling](./styling-popover) techniques apply unchanged:

<HintsDemo
  prefix="hint-theme"
  :config="{ popoverClass: 'driverjs-theme' }"
  :hints="[
    { element: '#export', popover: { title: 'Themed hint', description: 'Hint popovers are regular popovers, so every theme applies.' } },
  ]"
/>

```ts
useHints({
  popoverClass: "driverjs-theme",
  hints: [/* ... */],
});
```

## Your own beacon and popover

`<DriverHints>` has two main slots. `#beacon` renders the content of a beacon: the `<button class="driver-hint">` itself stays (positioned, labelled and wired to open the hint), and what you put in the slot replaces the default pulse and dot. `#popover` replaces the popover body like `#popover` on `<DriverTour>`; it receives the hint plus `dismiss()` and `close()`. The part slots (`#title`, `#description`, `#footer`, `#next`, `#arrow`) are available too; for a hint, `#next` is the dismiss button.

```vue
<DriverHints :hints="hints">
  <template #beacon="{ hint, isOpen }">
    <SparkleIcon class="my-beacon" :class="{ open: isOpen }" />
  </template>

  <template #popover="{ hint, popover, dismiss, close }">
    <div class="my-hint">
      <strong>{{ popover.title }}</strong>
      <p>{{ popover.description }}</p>
      <MyButton variant="ghost" @click="close">Later</MyButton>
      <MyButton @click="dismiss">Got it</MyButton>
    </div>
  </template>
</DriverHints>
```

The beacon button keeps its `driver-hint` class and is centered on its anchor point through inline `top` / `left`, so a custom icon sits exactly where the dot was. Resize the button with `--driver-hint-size`.

## Hint classes

```css
.driver-hint {} /* the beacon button */
.driver-hint[aria-expanded="true"] {} /* the open one */
.driver-hint-hidden {} /* element scrolled out of view */
.driver-hint-no-animation {} /* animate: false */
.driver-hint-pulse {} /* the pulsing ring */
.driver-hint-dot {} /* the dot */
.driver-hint-overlay {} /* the opt-in dim */
.driver-hint-popover {} /* added to a hint's popover */
```
