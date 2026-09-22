# Async Tour

Steps can be asynchronous: load data from the server, render an element on demand, then continue. Override `onNextClick` to take control of the next button and call `moveNext()` yourself when ready.

<AsyncTourDemo />

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

const { drive, driver } = useDriver({
  showProgress: true,
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
      // onDeselected is called when the step is left; remove the element.
      onDeselected: () => {
        document.querySelector(".dynamic-el")?.remove();
      },
    },
    { popover: { title: "Last step", description: "This is the last step." } },
  ],
});
</script>
```

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
