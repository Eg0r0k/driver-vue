<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * Highlight animation: a custom easing, an outline on the stage box (through
 * `stageClass`), a slide-up enter transition for the popover (through
 * `popoverClass` and the Vue transition classes) and a step number rendered
 * in the `#stage` slot.
 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const { drive, driver } = useDriver({
  duration: 500,
  easing: easeOutCubic,
  stageRadius: 8,
  stageClass: "docs-stage-ring",
  popoverClass: "docs-slide-up",
  steps: [
    {
      element: "#glow-title",
      popover: {
        title: "Stage outline",
        description: "The ring is a box-shadow on .driver-stage, added with stageClass.",
      },
    },
    {
      element: "#glow-search",
      popover: { title: "Easing", description: "The cutout moves here with easeOutCubic over 500 ms." },
    },
    {
      element: "#glow-export",
      popover: { title: "Stage slot", description: "The step number in the corner comes from the #stage slot." },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="glow">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with a custom animation</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver">
        <template #stage="{ index, total }">
          <span class="stage-badge">{{ index + 1 }}/{{ total }}</span>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.driver-stage.docs-stage-ring {
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
}

.driver-stage.docs-stage-ring[data-transitioning] {
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

@media (prefers-reduced-motion: no-preference) {
  .driver-popover.docs-slide-up.driver-popover-enter-active {
    transition:
      opacity 300ms ease-out,
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .driver-popover.docs-slide-up.driver-popover-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.stage-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  padding: 3px 7px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font:
    600 11px/1 var(--vp-font-family-base),
    sans-serif;
}
</style>
