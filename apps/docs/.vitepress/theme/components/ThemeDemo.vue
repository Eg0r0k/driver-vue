<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/** A dark theme made only of CSS variables (see `.docs-dark-theme` in custom.css). */
const { drive } = useDriver({
  popoverClass: "docs-dark-theme",
  showProgress: true,
  overlayOpacity: 0.55,
  steps: [
    { element: "#theme-title", popover: { title: "Dark theme", description: "Every color, radius and font here is a CSS variable." } },
    { element: "#theme-export", popover: { title: "Buttons too", description: "Button colors and radii come from --driver-popover-btn-*.", side: "right" } },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="theme" />
    <button type="button" class="demo-run" @click="drive()">Run with the dark theme</button>
    <ClientOnly>
      <DriverTour />
    </ClientOnly>
  </div>
</template>
