<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useDriver, DriverTour } from "driver-vue";

// A bouncy easing for the stage slide, plus a glowing `.driver-stage` styled
// in custom.css under `.docs-glow`, plus a corner badge from the `#stage` slot.
const easeOutBack = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

const { drive, driver } = useDriver({
  duration: 700,
  easing: easeOutBack,
  stageRadius: 12,
  showProgress: true,
  steps: [
    { element: "#glow-title", popover: { title: "Glowing stage", description: "The cutout carries a pulsing glow." } },
    { element: "#glow-search", popover: { title: "Custom easing", description: "The slide overshoots a little (ease-out-back)." } },
    { element: "#glow-export", popover: { title: "Stage slot", description: "The step badge in the corner comes from the #stage slot." } },
  ],
});

// The body class scopes the glow CSS to this demo's tour.
function toggleClass(active: boolean) {
  document.body.classList.toggle("docs-glow", active);
  document.body.classList.toggle("docs-slide", active);
}

onMounted(() => driver.setConfig({ ...driver.getConfig(), onHighlightStarted: () => toggleClass(true), onDestroyed: () => toggleClass(false) }));
onUnmounted(() => toggleClass(false));
</script>

<template>
  <div class="demo">
    <DemoBox prefix="glow" />
    <button type="button" class="demo-run" @click="drive()">Run with a glowing stage</button>
    <ClientOnly>
      <DriverTour>
        <template #stage="{ index, total }">
          <span class="glow-badge">{{ index + 1 }}/{{ total }}</span>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.glow-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  background: #4f46e5;
  color: #fff;
  font: 600 11px/1 ui-sans-serif, system-ui, sans-serif;
  padding: 6px 8px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>
