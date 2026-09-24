<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** Adds a "Go to first" button to the footer with the driver.js `onPopoverRender` hook. */
const { drive, driver } = useDriver({
  onPopoverRender: popover => {
    const firstButton = document.createElement("button");
    firstButton.type = "button";
    firstButton.className = "driver-popover-footer-btn";
    firstButton.innerText = "Go to first";
    firstButton.addEventListener("click", () => driver.moveTo(0));
    popover.footerButtons?.prepend(firstButton);
  },
  steps: [
    {
      element: "#btn-title",
      popover: { title: "Extra button", description: "onPopoverRender added Go to first to the footer." },
    },
    {
      element: "#btn-export",
      popover: { title: "Extra button", description: "It is added again each time a popover is shown.", side: "right" },
    },
    {
      element: "#btn-share",
      popover: { title: "Extra button", description: "Click Go to first to return to step 1.", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="btn">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
