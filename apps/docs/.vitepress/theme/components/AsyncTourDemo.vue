<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The element is created inside the demo box, in normal flow, right after the
 * summary paragraph, and it stays until the tour is destroyed, so stepping
 * backwards and forwards keeps showing it.
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
  heading.textContent = "Created on the fly ✨";
  const text = document.createElement("span");
  text.textContent = "This element did not exist when the tour started.";

  el.append(heading, text);
  summary.after(el);
};

const removeDynamicElement = () => {
  document.querySelector(".dynamic-el")?.remove();
};

const { drive, driver } = useDriver({
  showProgress: true,
  onDestroyed: removeDynamicElement,
  steps: [
    {
      element: "#async-title",
      popover: {
        title: "Next step is async",
        description: "The next element does not exist yet. onNextClick creates it and then calls moveNext().",
        onNextClick: () => {
          mountDynamicElement();
          driver.moveNext();
        },
      },
    },
    {
      element: ".dynamic-el",
      popover: {
        title: "Async element",
        description: "Created on demand, inside the box. It stays for the rest of the tour, so Previous works too.",
      },
    },
    { popover: { title: "Last step", description: "This is the last step." } },
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
