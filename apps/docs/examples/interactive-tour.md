# Interactive Tour

In some tours the reader moves forward by using the product: clicking the button the popover points at instead of a Next button in the popover. Two options cover this:

- `advanceOnClick` moves the tour on when the highlighted element is clicked.
- `waitForElement` makes a step wait for its element to appear in the DOM.

Both can be set in the driver config (all steps) or on a single step. The step value wins.

## Advancing on click

With `advanceOnClick: true`, a click on the highlighted element does what the next button does: it moves to the next step, and on the last step it ends the tour. The element's own click handler still runs. If the step has an `onNextClick` hook (or `onDoneClick` on the last step), the click calls that hook instead.

<Demo
  id="interactive-tour"
  title="Advance on click"
  :config="{ animate: true, showProgress: true, advanceOnClick: true }"
  :steps="[
    { element: '#inter-title', popover: { title: 'Click the heading', description: 'Clicking the highlighted element moves to the next step. The Next button still works.', side: 'bottom', align: 'start' } },
    { element: '#inter-search', popover: { title: 'Click the input', description: 'Clicking the input also moves the tour on.', side: 'top', align: 'start' } },
    { element: '#inter-export', popover: { title: 'Last step', description: 'On the last step, clicking the element ends the tour.', side: 'right', align: 'start' } },
  ]"
>
  <DemoBox prefix="inter" />
</Demo>

```ts
const { drive } = useDriver({
  advanceOnClick: true,
  showProgress: true,
  steps: [
    { element: "#pick-plan", popover: { title: "Pick a plan", description: "Click the highlighted card to continue." } },
    { element: "#billing-toggle", popover: { title: "Billing", description: "The toggle flips and the tour moves on." } },
    { element: "#checkout-btn", popover: { title: "Checkout", description: "Clicking the last element ends the tour." } },
  ],
});
```

To make the element the only way forward, hide the next button on that step with `popover.showButtons: ["close"]`.

`advanceOnClick` has no effect on a step with `disableActiveInteraction: true`, because that option blocks clicks on the element.

## Waiting for elements

A click often opens something new, such as a modal or a dropdown, and the next step points at an element inside it that does not exist yet. Give that step a `waitForElement` timeout in milliseconds. When the step is driven and its element is not in the DOM, the tour stays on the current step and watches the DOM until the element appears or the timeout runs out. The default is `0` (no waiting).

In the demo, the button renders the modal about a second after the click.

<WaitForElementDemo />

```ts
const { drive } = useDriver({
  steps: [
    {
      element: "#open-modal-btn",
      advanceOnClick: true,
      popover: {
        title: "Open the modal",
        description: "Click this button.",
        showButtons: ["close"],
      },
    },
    {
      element: "#modal-confirm",
      waitForElement: 5000,
      popover: {
        title: "Confirm",
        description: "This step is shown once the modal has rendered.",
      },
    },
  ],
});
```

If the element does not appear before the timeout, the step behaves like any step with a missing element: the popover is shown centered on the page, or the step is skipped when `skipMissingElement` is set.

When you need to run your own code before the next step (fetch data, render the element yourself), see [Async Tour](./async-tour). Tours that continue on another route are covered in [Multi-Page Tour](./multi-page-tour).
