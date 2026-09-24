# Popover Position

Two options in a step's `popover` place it:

- `side` is the side of the element the popover goes on: `"top"`, `"right"`, `"bottom"` or `"left"`. The default is `"bottom"`.
- `align` is the position along that side: `"start"` lines up the leading edges of the popover and the element, `"center"` centers the popover on the element, `"end"` lines up the trailing edges. The default is `"start"`.

<PositionDemo />

```ts
const { highlight } = useDriver();

highlight({
  element: "#position-target",
  popover: {
    title: "left / start",
    description: 'side: "left", align: "start"',
    side: "left",
    align: "start",
  },
});
```

## When the side does not fit

The popover goes on the requested `side` when the space between the element and the edge of the viewport on that side is large enough to hold it. If it is not, the opposite side is tried, then the two perpendicular sides: bottom and then top for `left` and `right`, left and then right for `top` and `bottom`. The `align` is kept.

Only the space along that one axis is measured. A popover on the right of an element that has scrolled above the viewport stays on the right.

When no side has room, for example for an element taller than a phone screen, the popover is centered at the bottom of the viewport and its arrow is hidden.

The popover is also shifted to stay inside the viewport. While its element scrolls out of view, the popover sticks to the nearest edge and the arrow moves to the popover edge that faces the element. What else can happen at that point is described in [Element Out of View](./scroll-away).

The side the popover ended up on is in its `data-side` attribute and in a `driver-popover-side-*` class (`data-align` and `driver-popover-align-*` for the alignment), so CSS can follow it.

## Offsets

`popoverOffset` is the gap between the highlighted area and the popover, in pixels (default `10`). `stagePadding` is the space between the element and the edge of the highlighted area (default `10`); a larger value also moves the popover away, since the gap is measured from the highlighted area.

<Demo
  inline
  button-text="popoverOffset: 40"
  :config="{ popoverOffset: 40 }"
  :highlight="{ element: '#position-target', popover: { title: 'popoverOffset: 40', description: 'The popover is 40 px from the highlighted area.' } }"
/>
<Demo
  inline
  button-text="stagePadding: 0"
  :config="{ stagePadding: 0 }"
  :highlight="{ element: '#position-target', popover: { title: 'stagePadding: 0', description: 'The highlighted area is the size of the element.' } }"
/>

```ts
const { drive } = useDriver({
  popoverOffset: 40,
  stagePadding: 0,
  steps: [/* ... */],
});
```

The positioning is done by `useDriverPosition`, which is exported for popovers you render yourself; see [Headless](../styling/headless).
