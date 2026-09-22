# Interactive Tour

Sometimes the best way forward in a tour is the product itself: click the button you are pointing at, not a "Next" in the popover. Two options make this work without custom hooks:

- `advanceOnClick` advances the tour when the highlighted element is clicked, exactly as if the next button was pressed. The element's own click behavior still runs.
- `waitForElement` makes a step wait up to the given number of milliseconds for its element to appear, staying on the current step in the meantime.

Both can be set for the whole tour or per step. The tour below has `advanceOnClick` on, so you can click the highlighted elements to walk through it.

<Demo
  id="interactive-tour"
  title="Advance on click"
  :config="{ animate: true, showProgress: true, advanceOnClick: true }"
  :steps="[
    { element: '#inter-title', popover: { title: 'Click to advance', description: 'This tour has advanceOnClick on. Click this highlighted heading to move on; the next button works too.', side: 'bottom', align: 'start' } },
    { element: '#inter-search', popover: { title: 'Also per step', description: 'Like most options, it can be set for the whole tour or per step. Click the input to continue.', side: 'top', align: 'start' } },
    { element: '#inter-export', popover: { title: 'Last step', description: 'On the last step, clicking the highlighted element ends the tour, like the done button.', side: 'right', align: 'start' } },
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
    { element: "#billing-toggle", popover: { title: "Billing", description: "Clicking advances the tour; the toggle still flips." } },
    { element: "#checkout-btn", popover: { title: "Checkout", description: "Clicking the last element ends the tour." } },
  ],
});
```

> For truly click-driven steps, hide the next button with `showButtons: ["close"]` on the step's popover so the highlighted element is the only way forward. `advanceOnClick` has no effect on steps where `disableActiveInteraction` blocks clicks on the element.

## Waiting for on-demand elements

Click-driven tours usually lead somewhere new: the click opens a modal or a dropdown whose elements do not exist yet. Give the next step a `waitForElement` timeout and the tour waits instead of falling back. In the demo below, clicking the highlighted button renders the "modal" about a second later; watch the tour hold the current step, then follow.

<WaitForElementDemo />

```ts
const { drive } = useDriver({
  steps: [
    {
      element: "#open-modal-btn",
      advanceOnClick: true,
      popover: {
        title: "Open the modal",
        description: "Clicking this button opens the modal and moves the tour on.",
        showButtons: ["close"],
      },
    },
    {
      // Rendered on demand: the tour waits up to 5 seconds for it,
      // staying on the previous step in the meantime.
      element: "#modal-confirm",
      waitForElement: 5000,
      popover: {
        title: "Confirm",
        description: "This step appeared once the modal rendered.",
      },
    },
  ],
});
```

If the element never appears, the wait times out into the usual missing-element behavior: the centered fallback popover, or a skip when `skipMissingElement` is set.

For full manual control over navigation instead, see [Async Tour](./async-tour). For tours that continue across page navigations, see [Multi-Page Tour](./multi-page-tour).
