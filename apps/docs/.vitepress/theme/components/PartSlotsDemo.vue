<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The default popover with three parts replaced through slots: the title gets
 * a step label, the progress text becomes dots, and the next button is a
 * plain button. Everything else (layout, description, close, previous) is the default.
 * The slot content uses the popover's CSS variables, so it follows any theme.
 */
const { drive, driver } = useDriver({
  showProgress: true,
  steps: [
    {
      element: "#parts-title",
      popover: {
        title: "Three parts replaced",
        description: "The title, the progress and the next button come from slots.",
      },
    },
    {
      element: "#parts-summary",
      popover: {
        title: "The rest is default",
        description: "The close button, the previous button and this description are not slotted.",
        side: "top",
      },
    },
    {
      element: "#parts-export",
      popover: { title: "Last step", description: "The next slot shows Finish on the last step.", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="parts">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with part slots</button>
      </template>
    </DemoBox>

    <ClientOnly>
      <DriverTour :driver="driver">
        <template #title="{ popover, index }">
          <header id="driver-popover-title" class="driver-popover-title">
            <span class="parts-label">Step {{ index + 1 }}</span>
            {{ popover.title }}
          </header>
        </template>

        <template #progress="{ index, total }">
          <span class="parts-dots" aria-hidden="true">
            <i v-for="n in total" :key="n" class="parts-dot" :class="{ 'parts-dot-on': n === index + 1 }" />
          </span>
        </template>

        <template #next="{ next, isLast }">
          <button type="button" class="parts-next" @click="next()">{{ isLast ? "Finish" : "Next" }}</button>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.parts-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--driver-popover-progress-color);
}

.parts-dots {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}

.parts-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--driver-popover-progress-color);
  opacity: 0.35;
}

.parts-dot-on {
  opacity: 1;
}

.parts-next {
  padding: 3px 10px;
  border: 0;
  border-radius: 4px;
  background: var(--driver-popover-color);
  color: var(--driver-popover-bg);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.parts-next:hover {
  opacity: 0.85;
}
</style>
