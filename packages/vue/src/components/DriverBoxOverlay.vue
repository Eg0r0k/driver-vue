<script setup lang="ts">
import { computed } from "vue";
import { getPaddedStage } from "../core/stage";
import type { StageRect } from "../types";

/**
 * An alternative overlay built from a box instead of an SVG path: the cutout
 * is a `div` at the stage rect whose huge `box-shadow` dims the rest of the
 * page. Because the cutout is a normal element, the highlight box animates
 * with plain CSS: with `animate: false` in the config the rect jumps and the
 * `transition` on `.driver-box-overlay-cutout` glides it (any timing function,
 * springs included); with `animate: true` the engine drives it frame by frame.
 *
 * Use it through `components: { overlay: DriverBoxOverlay }` or the `overlay`
 * slot. Decorate the cutout itself with `.driver-box-overlay-cutout`, or keep
 * using `.driver-stage` which tracks the same rect.
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
    /** The stage is animating between two elements. */
    transitioning?: boolean;
    /** The engine animates the rect per frame; the CSS transition is then disabled. */
    animated?: boolean;
    refreshTick?: number;
  }>(),
  {
    padding: 10,
    radius: 5,
    color: "#000",
    opacity: 0.7,
    zIndex: 10000,
    transitioning: false,
    animated: true,
    refreshTick: 0,
  }
);

const emit = defineEmits<{
  /** The dimmed area was clicked. */
  click: [event: MouseEvent];
}>();

const box = computed(() => getPaddedStage(props.stage, props.padding));

const rootStyle = computed(() => ({
  zIndex: props.zIndex,
}));

const cutoutStyle = computed(() => ({
  left: `${box.value.x}px`,
  top: `${box.value.y}px`,
  width: `${box.value.width}px`,
  height: `${box.value.height}px`,
  borderRadius: `${props.radius}px`,
  boxShadow: `0 0 0 200vmax ${props.color}`,
  opacity: props.opacity,
}));

const swallow = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

const onClick = (event: MouseEvent) => {
  swallow(event);
  emit("click", event);
};
</script>

<template>
  <div
    class="driver-overlay driver-box-overlay"
    :style="rootStyle"
    :data-transitioning="transitioning || undefined"
    :data-animated="animated || undefined"
    @pointerdown="swallow"
    @mousedown="swallow"
    @pointerup="swallow"
    @mouseup="swallow"
    @click="onClick"
  >
    <div class="driver-box-overlay-cutout" :style="cutoutStyle" />
  </div>
</template>
