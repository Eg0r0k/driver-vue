<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useDriver, DriverTour } from "driver-vue";

// A gentle easing for the stage slide, plus a glowing `.driver-stage` styled
// in custom.css under `.docs-glow`, plus a corner badge from the `#stage` slot.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const { drive, driver } = useDriver({
  duration: 500,
  easing: easeOutCubic,
  stageRadius: 12,
  showProgress: true,
  steps: [
    { element: "#glow-title", popover: { title: "Glowing stage", description: "The cutout carries a pulsing glow." } },
    {
      element: "#glow-search",
      popover: { title: "Custom easing", description: "The cutout glides in and settles (easeOutCubic, 500ms)." },
    },
    {
      element: "#glow-export",
      popover: { title: "Stage slot", description: "The step badge in the corner comes from the #stage slot." },
    },
  ],
});

// The body class scopes the glow CSS to this demo's tour.
const toggleClass = (active: boolean) => {
  document.body.classList.toggle("docs-glow", active);
  document.body.classList.toggle("docs-slide", active);
};

onMounted(() =>
  driver.setConfig({
    ...driver.getConfig(),
    onHighlightStarted: () => toggleClass(true),
    onDestroyed: () => toggleClass(false),
  })
);
onUnmounted(() => toggleClass(false));
</script>

<template>
  <div class="demo">
    <DemoBox prefix="glow">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with a glowing stage</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver">
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
  background: var(--vp-c-brand-1);
  color: #fff;
  font:
    600 11px/1 ui-sans-serif,
    system-ui,
    sans-serif;
  padding: 6px 8px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>
