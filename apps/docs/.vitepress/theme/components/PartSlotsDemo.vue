<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The default popover with three parts swapped through slots: the title gets
 * an icon, the progress text becomes dots, and the next button is our own.
 * Everything else (layout, description, close, previous) stays as shipped.
 */
const { drive, driver } = useDriver({
  showProgress: true,
  steps: [
    {
      element: "#parts-title",
      popover: {
        title: "Only three parts changed",
        description: "Title, progress and the next button come from slots.",
      },
    },
    {
      element: "#parts-summary",
      popover: {
        title: "The rest is the default",
        description: "Close, previous and this description are untouched.",
        side: "top",
      },
    },
    {
      element: "#parts-export",
      popover: { title: "Last step", description: "The next slot renders Finish on the last step.", side: "right" },
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
        <template #title="{ popover }">
          <header id="driver-popover-title" class="driver-popover-title parts-title">🧭 {{ popover.title }}</header>
        </template>

        <template #progress="{ index, total }">
          <span class="parts-dots" aria-hidden="true">
            <i v-for="n in total" :key="n" class="parts-dot" :class="{ 'parts-dot-on': n === index + 1 }" />
          </span>
        </template>

        <template #next="{ next, isLast }">
          <button type="button" class="parts-next" @click="next()">{{ isLast ? "Finish ✓" : "Next →" }}</button>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.parts-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.parts-dots {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}

.parts-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d4d4d8;
}

.parts-dot-on {
  background: var(--vp-c-brand-1);
}

.parts-next {
  padding: 4px 12px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.parts-next:hover {
  background: var(--vp-c-brand-2);
}
</style>
