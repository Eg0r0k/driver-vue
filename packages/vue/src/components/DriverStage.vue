<script setup lang="ts">
import { computed } from "vue";
import { getPaddedStage } from "../core/stage";
import type { StageRect } from "../types";

/**
 * An empty, non-interactive box that tracks the stage cutout. It ships with
 * no visual so the tour looks like driver.js; style `.driver-stage` (an
 * outline, a glow, a pulse) or fill the slot to decorate the highlight. The
 * rect is exposed as CSS variables for pseudo-elements and animations.
 */
const props = withDefaults(
  defineProps<{
    /** The cutout rect, without padding. */
    stage: StageRect;
    padding?: number;
    radius?: number;
    /** The stage is animating between two elements. */
    transitioning?: boolean;
    zIndex?: number;
  }>(),
  {
    padding: 10,
    radius: 5,
    transitioning: false,
    zIndex: 10000,
  }
);

const box = computed(() => getPaddedStage(props.stage, props.padding));

const style = computed(() => ({
  left: `${box.value.x}px`,
  top: `${box.value.y}px`,
  width: `${box.value.width}px`,
  height: `${box.value.height}px`,
  borderRadius: `${props.radius}px`,
  zIndex: props.zIndex + 1,
  "--driver-stage-x": `${box.value.x}px`,
  "--driver-stage-y": `${box.value.y}px`,
  "--driver-stage-width": `${box.value.width}px`,
  "--driver-stage-height": `${box.value.height}px`,
  "--driver-stage-radius": `${props.radius}px`,
}));
</script>

<template>
  <div class="driver-stage" :style="style" :data-transitioning="transitioning || undefined" aria-hidden="true">
    <slot />
  </div>
</template>
