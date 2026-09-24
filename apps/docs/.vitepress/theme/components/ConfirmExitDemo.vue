<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** Asks with `confirm()` before the tour ends early. */
const { drive, driver } = useDriver({
  onDestroyStarted: () => {
    if (!driver.hasNextStep() || confirm("Leave the tour?")) {
      driver.destroy();
    }
  },
  steps: [
    {
      element: "#confirm-title",
      popover: { title: "Try to leave", description: "Press Escape or click the overlay to see the confirmation." },
    },
    {
      element: "#confirm-search",
      popover: { title: "Step 2", description: "Cancel in the dialog keeps the tour open." },
    },
    {
      element: "#confirm-export",
      popover: { title: "Last step", description: "Here the tour ends without asking.", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="confirm">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
