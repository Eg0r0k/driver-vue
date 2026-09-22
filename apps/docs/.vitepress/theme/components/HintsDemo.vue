<script setup lang="ts">
import { computed } from "vue";
import { useHints, DriverHints, type DriverHint, type HintsConfig } from "driver-vue/hints";
import DemoBox from "./DemoBox.vue";

/**
 * A hints demo: a sample box plus a toggle button. `hints` target the box's
 * ids through the `prefix` (e.g. `#export` becomes `#<prefix>-export`).
 */
const props = withDefaults(
  defineProps<{
    prefix: string;
    config?: Omit<HintsConfig, "hints">;
    hints: DriverHint[];
    buttonText?: string;
  }>(),
  {
    config: () => ({}),
    buttonText: "Show hints",
  }
);

const resolved = computed(() =>
  props.hints.map(hint => ({
    ...hint,
    element: typeof hint.element === "string" ? hint.element.replace(/^#/, `#${props.prefix}-`) : hint.element,
  }))
);

const { hints, isVisible, show, hide } = useHints(() => ({ ...props.config, hints: resolved.value }));

const toggle = () => {
  if (isVisible.value) {
    hide();
  } else {
    show();
  }
};
</script>

<template>
  <div class="demo">
    <DemoBox :prefix="prefix" />
    <button type="button" class="demo-run" @click="toggle">
      {{ isVisible ? "Hide hints" : buttonText }}
    </button>
    <ClientOnly>
      <DriverHints :hints="hints" />
    </ClientOnly>
  </div>
</template>
