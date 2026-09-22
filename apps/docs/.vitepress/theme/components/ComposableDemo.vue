<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** The reactive refs returned by useDriver drive a status line in the page. */
const { drive, moveNext, movePrevious, destroy, isActive, activeIndex, isFirstStep, isLastStep } = useDriver({
  showButtons: ["close"],
  steps: [
    { element: "#comp-title", popover: { title: "Reactive state", description: "The buttons below are wired to the tour state." } },
    { element: "#comp-summary", popover: { title: "Step two", description: "isFirstStep / isLastStep update as you go.", side: "top" } },
    { element: "#comp-export", popover: { title: "Step three", description: "Last one.", side: "right" } },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="comp" />
    <div class="demo-row" style="margin-top: 12px">
      <button type="button" class="demo-button" @click="drive()">Start</button>
      <button type="button" class="demo-button secondary" :disabled="!isActive || isFirstStep" @click="movePrevious()">
        Previous
      </button>
      <button type="button" class="demo-button secondary" :disabled="!isActive" @click="moveNext()">
        {{ isLastStep ? "Finish" : "Next" }}
      </button>
      <button type="button" class="demo-button secondary" :disabled="!isActive" @click="destroy()">Stop</button>
      <span style="font-size: 13px">
        active: <code>{{ isActive }}</code>, index: <code>{{ activeIndex ?? "–" }}</code>
      </span>
    </div>
    <ClientOnly>
      <DriverTour />
    </ClientOnly>
  </div>
</template>
