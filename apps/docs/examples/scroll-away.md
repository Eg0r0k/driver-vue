# Element Out of View

The tour scrolls each element into view when its step starts, but nothing stops the reader from scrolling away afterwards. This page covers what the popover does then.

Start one of the demos below and scroll the page down until the box is gone.

<Demo
  id="away-stick"
  button-text="Stick (default)"
  :highlight="{ element: '#away-export', popover: { title: 'Export', description: 'Scroll down. The popover stays at the top edge and the arrow points up at this button.', side: 'right' } }"
>
  <DemoBox prefix="away" />
</Demo>

<Demo
  inline
  button-text="Close after 150px"
  :config="{ scrollAwayBehavior: 'close', scrollAwayOffset: 150 }"
  :highlight="{ element: '#away-export', popover: { title: 'Export', description: 'Scroll down. The popover closes once this button is 150px past the top of the screen.', side: 'right' } }"
/>
<Demo
  inline
  button-text="Click to scroll back"
  :config="{ scrollBackOnClick: true, smoothScroll: true }"
  :highlight="{ element: '#away-export', popover: { title: 'Export', description: 'Scroll down, then click this popover to scroll back to the button.', side: 'right' } }"
/>

## Stick to the edge

This is the default. The popover is kept inside the viewport, so when its element leaves the screen it stays at the nearest edge. The arrow moves to the edge of the popover that faces the element: a popover on the right of an element that went above the screen shows its arrow on the top edge, pointing up.

The popover keeps its side while the element is out of view. A popover on the `right` stays on the right. A popover on the `top` of an element that left through the top edge has no room above it any more, so it moves to the bottom; see [Popover Position](./popover-position) for how the side is picked.

While the element is out of view, the popover has the class `driver-popover-away`. Use it to change the look of a pinned popover:

```css
.driver-popover-away {
  opacity: 0.85;
}
```

## Scroll back on click

`scrollBackOnClick: true` makes the pinned popover clickable: a click anywhere on it, except the buttons, scrolls the element back into view. The scroll is smooth when `smoothScroll` is on. The popover gets the class `driver-popover-scroll-back` (with `cursor: pointer`) only while the click does something.

```ts
const { drive } = useDriver({
  scrollBackOnClick: true,
  smoothScroll: true,
  steps: [/* ... */],
});
```

## Close the tour

`scrollAwayBehavior: "close"` ends the tour once the element is out of view. `scrollAwayOffset` is how far past the viewport edge the element has to go first, in pixels (default `0`, as soon as the last pixel is gone).

```ts
const { drive } = useDriver({
  scrollAwayBehavior: "close",
  scrollAwayOffset: 150,
  steps: [/* ... */],
});
```

Closing goes through the same path as the close button, so `onDestroyStarted` runs and can keep the tour open (see [Exiting the Tour](./exiting)). With `allowClose: false` the tour does not close and the popover sticks instead.

Only scrolling done by the reader counts. The step's element may start outside the viewport and be scrolled into view by the tour; the check starts after the element has been on screen once.

## Your own behaviour

Pass a function to run your own code instead. It receives the element, the step and the usual hook options, and runs once each time the element leaves the viewport (again only after it came back):

```ts
const { drive } = useDriver({
  scrollAwayOffset: 300,
  scrollAwayBehavior: (element, step, { driver }) => {
    // Move on instead of closing.
    driver.moveNext();
  },
  steps: [/* ... */],
});
```

## Custom popovers

A popover built with the `#popover` slot or `popover.component` receives `away` (the element is out of view) and `scrollBack()` in its props, so it can render its own "Back to the element" button:

```vue
<DriverTour>
  <template #popover="{ popover, away, scrollBack, next }">
    <h3>{{ popover.title }}</h3>
    <p>{{ popover.description }}</p>
    <button v-if="away" @click="scrollBack">Show the element</button>
    <button @click="next">Next</button>
  </template>
</DriverTour>
```

For a fully custom popover, `useDriverPosition` returns the same information as `referenceHidden`; see [Headless](../styling/headless).
