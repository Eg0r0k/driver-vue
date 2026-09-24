<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** The controls under the panel are driven by the refs returned by useDriver. */
const { drive, moveNext, movePrevious, destroy, isActive, activeIndex, isFirstStep, isLastStep, driver } = useDriver({
  showButtons: ["close"],
  steps: [
    {
      element: "#comp-title",
      popover: {
        title: "Step 1",
        description: "The buttons under the panel call moveNext(), movePrevious() and destroy().",
      },
    },
    {
      element: "#comp-summary",
      popover: { title: "Step 2", description: "Previous is enabled because isFirstStep is now false.", side: "top" },
    },
    {
      element: "#comp-export",
      popover: { title: "Step 3", description: "isLastStep is true, so Next reads Finish.", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="comp">
      <template #footer>
        <div class="demo-row comp-controls driver-interactive">
          <button type="button" class="demo-run" @click="drive()">Start</button>
          <button type="button" class="demo-button" :disabled="!isActive || isFirstStep" @click="movePrevious()">
            Previous
          </button>
          <button type="button" class="demo-button" :disabled="!isActive" @click="moveNext()">
            {{ isLastStep ? "Finish" : "Next" }}
          </button>
          <button type="button" class="demo-button" :disabled="!isActive" @click="destroy()">Stop</button>
          <span class="comp-status">
            isActive: <code>{{ isActive }}</code
            >, activeIndex: <code>{{ activeIndex ?? "undefined" }}</code>
          </span>
        </div>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>

<style>
.driver-active .comp-controls {
  position: relative;
  z-index: calc(var(--driver-z-index, 10000) + 2);
}

.comp-status {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
