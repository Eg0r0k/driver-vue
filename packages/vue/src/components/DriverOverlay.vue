<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { generateStageSvgPathString, getViewport, type Viewport } from "../core/stage";
import type { StageRect } from "../types";

/**
 * The dimmed page with the stage cut out: a full-screen SVG whose single
 * evenodd path is the dim minus the rounded cutout. Only the path receives
 * pointer events, so the cutout stays interactive.
 */
const props = withDefaults(
  defineProps<{
    /** The cutout rect, without padding. */
    stage: StageRect;
    padding?: number;
    radius?: number;
    color?: string;
    opacity?: number;
    zIndex?: number;
    /** Bump to re-measure the viewport (resize). */
    refreshTick?: number;
  }>(),
  {
    padding: 10,
    radius: 5,
    color: "#000",
    opacity: 0.7,
    zIndex: 10000,
    refreshTick: 0,
  }
);

const emit = defineEmits<{
  /** The dimmed area was clicked. */
  click: [event: MouseEvent];
}>();

const viewport = ref<Viewport>(getViewport());

onMounted(() => {
  viewport.value = getViewport();
});

watch(
  () => props.refreshTick,
  () => {
    viewport.value = getViewport();
  }
);

const viewBox = computed(() => `0 0 ${viewport.value.width} ${viewport.value.height}`);

const path = computed(() =>
  generateStageSvgPathString(props.stage, { padding: props.padding, radius: props.radius }, viewport.value)
);

const svgStyle = computed(() => ({
  zIndex: props.zIndex,
}));

const pathStyle = computed(() => ({
  fill: props.color,
  opacity: props.opacity,
}));

function onPathClick(event: MouseEvent) {
  // Driver's own UI never leaks clicks to the page underneath.
  event.preventDefault();
  event.stopPropagation();
  emit("click", event);
}
</script>

<template>
  <svg
    class="driver-overlay driver-overlay-animated"
    :viewBox="viewBox"
    xml:space="preserve"
    preserveAspectRatio="xMinYMin slice"
    :style="svgStyle"
  >
    <path class="driver-overlay-path" :d="path" :style="pathStyle" @click="onPathClick" />
  </svg>
</template>
