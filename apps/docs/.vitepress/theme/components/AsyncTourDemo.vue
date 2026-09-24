<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The element is created inside the demo box, right after the summary
 * paragraph, and stays until the tour is destroyed, so Previous and Next keep
 * finding it.
 */
const mountDynamicElement = () => {
  if (document.querySelector(".dynamic-el")) {
    return;
  }

  const summary = document.getElementById("async-summary");
  if (!summary) {
    return;
  }

  const el = document.createElement("div");
  el.className = "dynamic-el";

  const heading = document.createElement("strong");
  heading.textContent = "Created on the fly";
  const text = document.createElement("span");
  text.textContent = "This element did not exist when the tour started.";

  el.append(heading, text);
  summary.after(el);
};

const removeDynamicElement = () => {
  document.querySelector(".dynamic-el")?.remove();
};

// Stands in for a request or any other async work.
const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

let loading = false;

const { drive, driver } = useDriver({
  showProgress: true,
  onDestroyed: removeDynamicElement,
  steps: [
    {
      element: "#async-title",
      popover: {
        title: "Next step is async",
        description:
          "The next element does not exist yet. Next waits half a second, creates it, then calls moveNext().",
        onNextClick: async () => {
          if (loading) {
            return;
          }

          loading = true;
          await wait(500);
          loading = false;

          if (!driver.isActive()) {
            return;
          }

          mountDynamicElement();
          driver.moveNext();
        },
      },
    },
    {
      element: ".dynamic-el",
      popover: {
        title: "Created element",
        description: "It stays until the tour ends, so Previous and Next both work.",
      },
    },
    { popover: { title: "Last step", description: "The created element is removed when the tour ends." } },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="async">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run the async tour</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
