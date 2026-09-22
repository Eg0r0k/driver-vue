<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { drive, driver } = useDriver({
  showProgress: true,
  showButtons: ["next", "previous"],
  steps: [
    {
      element: "#confirm-title",
      popover: {
        title: "Confirm on exit",
        description: "Try pressing Escape or clicking the overlay before the last step.",
      },
    },
    {
      element: "#confirm-export",
      popover: { title: "Still here", description: "You confirmed you want to stay (or never tried).", side: "right" },
    },
    { popover: { title: "Last step", description: "On the last step the tour closes without asking." } },
  ],
  // onDestroyStarted is called when the user tries to exit the tour
  onDestroyStarted: () => {
    if (!driver.hasNextStep() || confirm("Are you sure you want to leave the tour?")) {
      driver.destroy();
    }
  },
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="confirm" />
    <button type="button" class="demo-run" @click="drive()">Run with confirmation</button>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>
