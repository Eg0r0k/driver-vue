<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The `#overlay` slot replaces the SVG dim with four blurred panels around
 * the stage rect, so the page behind is frosted instead of darkened. The
 * slot receives the (interpolated) stage and the padding, so the panels
 * follow the animation frame by frame.
 */
const { drive, driver } = useDriver({
  stagePadding: 8,
  steps: [
    {
      element: "#ovl-title",
      popover: { title: "Frosted overlay", description: "Four blurred panels instead of an SVG path." },
    },
    {
      element: "#ovl-export",
      popover: { title: "Still animated", description: "The panels are driven by the same stage rect.", side: "right" },
    },
  ],
});

const panels = (stage: { x: number; y: number; width: number; height: number }, padding: number) => {
  const x = stage.x - padding;
  const y = stage.y - padding;
  const w = stage.width + padding * 2;
  const h = stage.height + padding * 2;

  return [
    { top: 0, left: 0, right: 0, height: `${Math.max(y, 0)}px` },
    { top: `${y + h}px`, left: 0, right: 0, bottom: 0 },
    { top: `${y}px`, left: 0, width: `${Math.max(x, 0)}px`, height: `${h}px` },
    { top: `${y}px`, left: `${x + w}px`, right: 0, height: `${h}px` },
  ];
};
</script>

<template>
  <div class="demo">
    <DemoBox prefix="ovl">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with a frosted overlay</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver">
        <template #overlay="{ stage, padding, zIndex, onClick }">
          <!-- The panels carry `driver-interactive` so the tour's page-wide
               `pointer-events: none` cannot swallow the overlay click. The
               root stays inert, so clicks inside the cutout still reach the
               highlighted element. -->
          <div class="frost" :style="{ zIndex }" @click="onClick">
            <div
              v-for="(style, i) in panels(stage, padding)"
              :key="i"
              class="frost-panel driver-interactive"
              :style="style"
            />
          </div>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.frost {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.frost-panel {
  position: absolute;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px) saturate(0.8);
  -webkit-backdrop-filter: blur(6px) saturate(0.8);
}

.dark .frost-panel {
  background: rgba(0, 0, 0, 0.35);
}
</style>
