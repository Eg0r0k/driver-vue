# Smooth Scroll

When the element of a step is not fully in the viewport, the tour scrolls it into view. The scroll is instant by default, as in driver.js. With `smoothScroll: true` it is animated.

```ts
const { drive } = useDriver({
  smoothScroll: true,
  steps: [
    { element: "#page-header", popover: { title: "Top", description: "The tour starts at the top of the page." } },
    { element: "#page-footer", popover: { title: "Bottom", description: "The page scrolls down to this element." } },
  ],
});
```

The second step of the demo below is a box at the bottom of this page, and the third step comes back up here.

<Demo
  id="smooth-scroll-demo"
  button-text="Run with smoothScroll: true"
  :config="{ smoothScroll: true }"
  :steps="[
    { element: '#smooth-top-title', popover: { title: 'Top', description: 'The next step is at the bottom of the page.' } },
    { element: '#smooth-bottom-share', popover: { title: 'Bottom', description: 'The page scrolled down with an animation.', side: 'top' } },
    { element: '#smooth-top-export', popover: { title: 'Top again', description: 'And back up.', side: 'right' } },
  ]"
>
  <DemoBox prefix="smooth-top" />
</Demo>

<Demo
  inline
  button-text="Run with smoothScroll: false"
  :steps="[
    { element: '#smooth-top-title', popover: { title: 'Top', description: 'The next step is at the bottom of the page.' } },
    { element: '#smooth-bottom-share', popover: { title: 'Bottom', description: 'The page jumped here without an animation.', side: 'top' } },
    { element: '#smooth-top-export', popover: { title: 'Top again', description: 'And back up.', side: 'right' } },
  ]"
/>

## How the scroll works

- A step whose element is already fully in the viewport does not scroll the page.
- The tour calls `element.scrollIntoView()` with `block: "center"` and `inline: "center"`. An element taller than the viewport is scrolled with `block: "start"`, so its top edge is visible.
- If the direct parent of the element is a scroll container (its content is taller than its box), the scroll is always instant. A smooth scroll inside a nested container would finish after the highlight has been measured, and the highlight would end up in the wrong place.
- `smoothScroll` applies to the whole tour and cannot be set per step. Change it between tours with `setConfig`.

If the page layout keeps moving after the scroll (images loading, a sticky header settling), the highlight can end up offset. Call `driver.refresh()` once the layout is stable, or use `waitForElement` for content that renders late (see [Interactive Tour](./interactive-tour)). For what happens when the reader scrolls the element away during a step, see [Element Out of View](./scroll-away).

## Blocking page scroll

With `allowScroll: false` the reader cannot scroll the page while the tour runs: the tour adds the `driver-no-scroll` class to `<body>`, which sets `overflow: hidden` on it. The tour's own scrolling still works. The default is `true`.

<Demo
  inline
  button-text="Run with allowScroll: false"
  :config="{ allowScroll: false, smoothScroll: true }"
  :steps="[
    { element: '#smooth-top-title', popover: { title: 'Scroll blocked', description: 'The mouse wheel does not move the page now.' } },
    { element: '#smooth-bottom-share', popover: { title: 'Bottom', description: 'The tour can still scroll the page.', side: 'top' } },
  ]"
/>

```ts
const { drive } = useDriver({
  allowScroll: false,
  steps: [/* ... */],
});
```

<div class="smooth-spacer">
  <p>Space between the two demo boxes, so the scroll is visible.</p>
</div>

<DemoBox prefix="smooth-bottom" />
