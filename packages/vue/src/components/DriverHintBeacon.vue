<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from "vue";
import type { MountedHint } from "../core/hints";

/**
 * One hint beacon: a fixed button centered on its anchor point with a pulse
 * ring and a dot. The button (position, aria, click) is the contract; the
 * content inside is the `default` slot.
 */
const props = withDefaults(
  defineProps<{
    entry: MountedHint;
    /** Document offset of the positioned container the beacon lives in. */
    originX?: number;
    originY?: number;
  }>(),
  { originX: 0, originY: 0 }
);

const emit = defineEmits<{
  click: [];
  mounted: [id: string, element: HTMLElement];
  unmounted: [id: string];
}>();

const button = useTemplateRef<HTMLElement>("button");

const classes = computed(() => [
  "driver-hint",
  props.entry.className,
  {
    "driver-hint-no-animation": !props.entry.animate,
    "driver-hint-hidden": props.entry.hidden,
  },
]);

const style = computed(() => ({
  top: `${props.entry.pageY - props.originY}px`,
  left: `${props.entry.pageX - props.originX}px`,
}));

const onClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  emit("click");
};

onMounted(() => {
  if (button.value) {
    emit("mounted", props.entry.id, button.value);
  }
});

onBeforeUnmount(() => {
  emit("unmounted", props.entry.id);
});
</script>

<template>
  <button
    ref="button"
    type="button"
    :class="classes"
    :style="style"
    :aria-label="entry.label"
    aria-haspopup="dialog"
    :aria-expanded="entry.expanded ? 'true' : 'false'"
    :data-hint-id="entry.id"
    @click="onClick"
  >
    <slot>
      <span class="driver-hint-pulse" />
      <span class="driver-hint-dot" />
    </slot>
  </button>
</template>
