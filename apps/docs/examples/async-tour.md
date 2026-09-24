# Async Tour

A step can do async work before the tour moves on, for example load data or render the element the next step points at. Give the step an `onNextClick` hook, do the work in it, and call `driver.moveNext()` when it is done.

Setting `onNextClick` replaces the default behavior of the next button, so the tour does not move until you call `moveNext()`. The same rule applies to the other button hooks; see [Buttons](./buttons).

In the demo, the element of the second step does not exist when the tour starts. Next on the first step waits half a second, creates the element inside the box under the summary, and then calls `moveNext()`.

<AsyncTourDemo />

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";

// Inserts the card in normal flow, next to the content it belongs to, so the
// tour scrolls to it and highlights it like any other element.
const renderReportCard = async () => {
  if (document.querySelector("#report-card")) {
    return; // already created: Previous, then Next again
  }

  const report = await fetchReport();
  const card = document.createElement("div");
  card.id = "report-card";
  card.textContent = report.summary;
  document.querySelector("#summary")?.after(card);
};

const { drive, driver } = useDriver({
  showProgress: true,
  onDestroyed: () => {
    document.querySelector("#report-card")?.remove();
  },
  steps: [
    {
      element: "#title",
      popover: {
        title: "Next step is async",
        description: "The next element does not exist yet.",
        onNextClick: async () => {
          await renderReportCard();
          driver.moveNext();
        },
      },
    },
    {
      element: "#report-card",
      popover: { title: "Your report", description: "This element was created on demand." },
    },
    { popover: { title: "Last step", description: "This is the last step." } },
  ],
});
</script>
```

Remove the element in `onDestroyed`, when the tour ends. `onDeselected` runs every time the step is left, in both directions, so removing the element there leaves nothing to highlight when the reader presses Previous on the next step. If the element has to go when its step is left, create it again in the next step's `onPrevClick` and then call `driver.movePrevious()`.

If the reader closes the tour while the hook is still waiting, `moveNext()` does nothing, but an element created after that point stays on the page. Check `driver.isActive()` before creating it if that matters.

If the element is rendered by the page itself (for example, a click on the highlighted button opens a modal), you do not need `onNextClick`. Use `waitForElement` on the next step instead, as shown in [Interactive Tour](./interactive-tour#waiting-for-elements).
