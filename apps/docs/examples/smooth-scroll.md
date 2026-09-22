# Smooth Scroll

Steps rarely sit next to each other. When the next element is outside the viewport the tour scrolls it into view — instantly by default, exactly as in driver.js. Set `smoothScroll: true` and the scroll is animated instead:

```ts
const { drive } = useDriver({
  smoothScroll: true,
  steps: [
    { element: "#page-header", popover: { title: "Up here", description: "The tour starts at the top." } },
    { element: "#page-footer", popover: { title: "Way down there", description: "The page scrolls to it." } },
    { element: "#page-header", popover: { title: "And back", description: "Scrolling works in both directions." } },
  ],
});
```

## Try it

The second step of this tour is the box at the very bottom of the page, and the third comes back up here.

<Demo
  id="smooth-scroll-demo"
  button-text="Run with smoothScroll"
  :config="{ smoothScroll: true, showProgress: true }"
  :steps="[
    { element: '#smooth-top-title', popover: { title: 'Up here', description: 'The tour starts at the top of the page.' } },
    { element: '#smooth-bottom-share', popover: { title: 'Way down there', description: 'The next element is a full screen below; the page scrolls to it smoothly.', side: 'top' } },
    { element: '#smooth-top-export', popover: { title: 'And back up', description: 'Scrolling works in both directions.', side: 'right' } },
  ]"
>
  <DemoBox prefix="smooth-top" />
</Demo>

<Demo
  inline
  button-text="Compare: the same tour without it"
  :config="{ smoothScroll: false, showProgress: true }"
  :steps="[
    { element: '#smooth-top-title', popover: { title: 'Up here', description: 'The same tour with smoothScroll off.' } },
    { element: '#smooth-bottom-share', popover: { title: 'Way down there', description: 'The page jumps instead of scrolling.', side: 'top' } },
    { element: '#smooth-top-export', popover: { title: 'And back up', description: 'Instant again.', side: 'right' } },
  ]"
/>

## What it actually does

- The tour only scrolls when the element is **not already fully in view**. A step whose element is on screen never moves the page, with or without the option.
- The scroll is a plain `element.scrollIntoView({ behavior: "smooth", inline: "center", block: "center" })`. An element taller than the viewport is aligned to `block: "start"` instead, so its top edge is visible.
- **Elements inside a scrollable container still scroll instantly.** Smooth scrolling of a nested scroller races the highlight: the cutout is measured before the scroll settles and ends up in the wrong place. The engine detects a scrollable parent and falls back to `behavior: "auto"` for those elements.
- The popover is brought into view the same way, so a popover that would land off-screen follows its element.
- `smoothScroll` is a driver-level option. Like every other config key it can be changed between tours with `setConfig`, but not per step.

Users who have asked their system for reduced motion get no animation from `scrollIntoView`; browsers honour `prefers-reduced-motion` for it, so the option is safe to turn on globally.

## Related options

| Option | Effect |
| --- | --- |
| `smoothScroll` | animate the scroll that brings an element into view (default `false`) |
| `allowScroll` | when `false`, the page cannot be scrolled by the user while the tour runs — the tour's own scrolling still works (default `true`) |
| `disableActiveInteraction` | the highlighted element is not clickable |

If the page keeps moving after the highlight (lazy images, a sticky header settling, an animation), the cutout can end up offset. Call `driver.refresh()` once the layout is stable, or give the step a `waitForElement` so the tour starts after the content has rendered — see [Interactive Tour](./interactive-tour).

<div class="smooth-spacer">
  <p>Keep scrolling. This filler exists so the two demo boxes are a screen apart and the scrolling is actually visible.</p>
</div>

<DemoBox prefix="smooth-bottom" />
