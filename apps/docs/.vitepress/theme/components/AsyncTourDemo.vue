<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

function mountDynamicElement() {
  const el = (document.querySelector(".dynamic-el") || document.createElement("div")) as HTMLElement;
  el.className = "dynamic-el";
  el.textContent = "This is a new element";
  el.style.top = `${Math.random() * 300 + 60}px`;
  el.style.left = `${Math.random() * 300 + 60}px`;
  document.body.appendChild(el);
}

function removeDynamicElement() {
  document.querySelector(".dynamic-el")?.remove();
}

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
        description: "This element was created on demand and is removed when we move away.",
        onPrevClick: () => {
          removeDynamicElement();
          driver.movePrevious();
        },
      },
      onDeselected: removeDynamicElement,
    },
    { popover: { title: "Last step", description: "This is the last step." } },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="async" />
    <button type="button" class="demo-run" @click="drive()">Run the async tour</button>
    <ClientOnly>
      <DriverTour />
    </ClientOnly>
  </div>
</template>
