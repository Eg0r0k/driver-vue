# Async Tour

Steps can be asynchronous: load data from the server, render an element on demand, then continue. Override `onNextClick` to take control of the next button and call `moveNext()` yourself when ready.

The element the second step points at does not exist when the tour starts. Clicking **Next** on the first step creates it inside the box, in normal flow, right under the summary — and leaves it there for the rest of the tour, so going back and forward again still finds it.

<AsyncTourDemo />

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

// Create the element where it belongs in the page — in normal flow, next to
// the content it relates to — so the tour scrolls to it and highlights it
// like any other element. Creating it only once keeps Previous/Next working.
const mountDynamicElement = () => {
  if (document.querySelector(".dynamic-el")) return;

  const el = document.createElement("div");
  el.className = "dynamic-el";
  el.textContent = "Created on the fly ✨";
  document.querySelector("#summary")?.after(el);
};

const { drive, driver } = useDriver({
  showProgress: true,
  // The element belongs to the tour, so remove it when the tour ends —
  // not when the step is left, or Previous would land on nothing.
  onDestroyed: () => {
    document.querySelector(".dynamic-el")?.remove();
  },
  steps: [
    {
      element: "#title",
      popover: {
        title: "Next step is async",
        description: "The next element does not exist yet.",
        // By passing onNextClick you override the default behavior of the
        // next button: the driver no longer moves on by itself, you call
        // driver.moveNext() when the element is ready.
        onNextClick: async () => {
          await mountDynamicElement();
          driver.moveNext();
        },
      },
    },
    {
      element: ".dynamic-el",
      popover: {
        title: "Async element",
        description: "This element was created on demand.",
      },
    },
    { popover: { title: "Last step", description: "This is the last step." } },
  ],
});
</script>
```

> `onDeselected` runs whenever a step is left, in both directions, so removing the element there makes the step unreachable from the next step's **Previous** button. Tear down in `onDestroyed` instead, or re-create the element in the next step's `onPrevClick`.

> By overriding `onNextClick` and `onPrevClick` you control navigation: the buttons no longer move by themselves and you call `driver.moveNext()` / `driver.movePrevious()` to move. Both hooks can be set at the driver level (all steps) or at the step level (that step only).

## Waiting for elements

When the next element is rendered on demand you often do not need the manual `onNextClick` dance at all. Give the step a `waitForElement` timeout and the tour waits for the element, staying on the current step in the meantime. Pair it with `advanceOnClick` when the highlighted element itself triggers the rendering, e.g. a button that opens a modal:

```ts
const { drive } = useDriver({
  steps: [
    {
      element: "#open-modal-btn",
      // Clicking the highlighted button acts like pressing next;
      // the button's own click still runs and opens the modal.
      advanceOnClick: true,
      popover: {
        title: "Open the modal",
        description: "Click this button to continue.",
        showButtons: ["close"],
      },
    },
    {
      element: "#modal-confirm",
      // Wait up to 5 seconds for the modal to render before treating the
      // element as missing.
      waitForElement: 5000,
      popover: {
        title: "Confirm",
        description: "This step appeared once the modal rendered.",
      },
    },
  ],
});
```

If the element never shows up, the wait times out into the usual missing-element behavior: the centered fallback popover, or a skip when `skipMissingElement` is set. Both options can also be set at the driver level.

See [Interactive Tour](./interactive-tour) for live demos of both options, and [Multi-Page Tour](./multi-page-tour) for continuing a tour across navigations.
