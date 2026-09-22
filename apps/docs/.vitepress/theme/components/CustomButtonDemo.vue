<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * Two ways to add a button: the `#footer`-adjacent `#prev` slot (Vue) and
 * the driver.js `onPopoverRender` hook (DOM). Both work.
 */
const { drive, driver } = useDriver({
  prevBtnText: "&larr; Previous",
  nextBtnText: "Next &rarr;",
  showButtons: ["next", "previous"],
  onPopoverRender: popover => {
    const firstButton = document.createElement("button");
    firstButton.type = "button";
    firstButton.className = "driver-popover-footer-btn";
    firstButton.innerText = "Go to first";
    popover.footerButtons?.prepend(firstButton);
    firstButton.addEventListener("click", () => driver.drive(0));
  },
  steps: [
    {
      element: "#btn-title",
      popover: {
        title: "More control with hooks",
        description: "onPopoverRender added the 'Go to first' button to the footer.",
      },
    },
    {
      element: "#btn-export",
      popover: {
        title: "Still driver.js",
        description: "The hook receives the same PopoverDOM as driver.js.",
        side: "right",
      },
    },
    {
      element: "#btn-share",
      popover: { title: "Try it", description: "Click 'Go to first' to jump back.", side: "top" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="btn" />
    <button type="button" class="demo-run" @click="drive()">Run with a custom button</button>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
