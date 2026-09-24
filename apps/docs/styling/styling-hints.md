# Styling Hints

A hint has two visible parts: the beacon (a pulsing dot on the element) and the popover that opens from it. The beacon is styled with CSS variables and classes, the popover like any tour popover, and both can be replaced through slots on `<DriverHints>`. For how hints work, see the [Hints example](../examples/hints).

## Beacon color and size

Beacons read `--driver-hint-color` (default `#818cf8`) and `--driver-hint-size` (default `24px`). Set them on `.driver-hint` for all beacons, or give a beacon a `className` and set them under that class:

<HintsDemo
  prefix="hint-styled"
  :hints="[
    { element: '#export', beacon: { className: 'docs-hint-rose' }, popover: { title: 'Another color', description: 'beacon.className sets a class that changes --driver-hint-color.' } },
    { element: '#summary', beacon: { className: 'docs-hint-large', side: 'left', align: 'center' }, popover: { title: 'A larger beacon', description: 'This class only changes --driver-hint-size.' } },
  ]"
/>

```css
/* All beacons */
.driver-hint {
  --driver-hint-color: #64748b;
}

/* Beacons with a class */
.my-large-hint {
  --driver-hint-size: 32px;
}
```

```ts
useHints({
  hints: [
    {
      element: "#export-btn",
      beacon: { className: "my-large-hint" },
      popover: { title: "Export", description: "..." },
    },
  ],
});
```

The dot is `.driver-hint-dot` and the ring around it `.driver-hint-pulse`; both are filled with `--driver-hint-color`.

## Static beacons

The ring pulses every `--driver-hint-animation-duration` (default `2s`). Set `animate: false` on a hint's `beacon`, or in the instance-level `beacon` defaults, for a dot without the pulse. The beacon then gets `driver-hint-no-animation`. For users who prefer reduced motion the pulse is off in any case.

<HintsDemo
  prefix="hint-static"
  :config="{ beacon: { animate: false } }"
  :hints="[
    { element: '#export', popover: { title: 'No pulse', description: 'beacon.animate is false for every hint.' } },
    { element: '#share', popover: { title: 'No pulse', description: 'The instance-level beacon default applies here too.' } },
  ]"
/>

```ts
useHints({
  // Applies to every hint; a hint's own beacon config wins.
  beacon: { animate: false },
  hints: [
    /* ... */
  ],
});
```

## Theming the popover

Hint popovers are regular popovers with an extra `driver-hint-popover` class, a 7 px arrow and a drop shadow. `popoverClass` (for the instance or per hint), the CSS variables and the other [popover styling](./styling-popover) techniques apply to them:

<HintsDemo
  prefix="hint-theme"
  :config="{ popoverClass: 'driverjs-theme' }"
  :hints="[
    { element: '#export', popover: { title: 'Themed hint', description: 'popoverClass driverjs-theme, the same class as the tour example.' } },
  ]"
/>

```ts
useHints({
  popoverClass: "driverjs-theme",
  hints: [
    /* ... */
  ],
});
```

## The overlay

With `overlay: true` an open hint dims the page ([Dimming the page](../examples/hints#dimming-the-page) describes the behaviour). The color and opacity come from `overlayColor` and `overlayOpacity` in the hints config. The dim is an SVG with the class `driver-hint-overlay`; it fades in over 200 ms through a Vue transition named `driver-hint-overlay`, which you can override:

```css
.driver-hint-overlay-enter-active {
  transition: opacity 400ms ease-out;
}
```

## Your own beacon and popover

`<DriverHints>` has two main slots. `#beacon` renders the content of a beacon: the `<button class="driver-hint">` itself stays (positioned, labelled and wired to open the hint), and what you put in the slot replaces the pulse and the dot. `#popover` replaces the popover body like [`#popover` on `<DriverTour>`](./custom-components#the-popover-slot); it receives the hint plus `dismiss()` and `close()`. The part slots `#title`, `#description`, `#footer`, `#next` and `#arrow` are available too; for a hint, `#next` is the dismiss button.

```vue
<DriverHints :hints="hints">
  <template #beacon="{ hint, isOpen }">
    <InfoIcon class="my-beacon" :class="{ open: isOpen }" />
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

The beacon button keeps its `driver-hint` class and is centered on its anchor point with inline `top` and `left`, so a custom icon sits where the dot was. Its size is `--driver-hint-size`.

The classes of beacons and hint popovers are listed with the others in [Theming](../guide/theming#class-names).
