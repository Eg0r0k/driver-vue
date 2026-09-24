<script setup lang="ts">
import { injectDriver, type Config, type DriveStep } from "driver-vue";

/**
 * The stock demo block: a bordered box of sample content (or targets
 * elsewhere on the page) and a Run button that drives the shared plugin
 * driver with the given config and steps.
 */
const props = withDefaults(
  defineProps<{
    id?: string;
    title?: string;
    buttonText?: string;
    config?: Config;
    steps?: DriveStep[];
    highlight?: DriveStep;
    /** Render the sample content box (default true when steps/highlight target it). */
    box?: boolean;
    /** Inline button, no full-width layout (for button rows). */
    inline?: boolean;
  }>(),
  {
    id: undefined,
    title: undefined,
    buttonText: "Run",
    config: () => ({}),
    steps: undefined,
    highlight: undefined,
    box: true,
    inline: false,
  }
);

const shared = injectDriver({ optional: true });

const run = () => {
  const driver = shared?.value;
  if (!driver) {
    return;
  }

  driver.destroy();
  driver.setConfig({ ...props.config, steps: props.steps });

  if (props.highlight) {
    driver.highlight(props.highlight);
  } else {
    driver.drive();
  }
};
</script>

<template>
  <div :id="id" :class="['demo', { 'demo-inline': inline }]">
    <p v-if="title" class="demo-heading">{{ title }}</p>
    <div v-if="box && $slots.default" class="demo-box">
      <slot />
      <div class="demo-box-footer">
        <button type="button" class="demo-run" @click="run">{{ buttonText }}</button>
      </div>
    </div>
    <button v-else type="button" :class="inline ? 'demo-button' : 'demo-run'" @click="run">
      {{ buttonText }}
    </button>
  </div>
</template>

<style scoped>
.demo-inline {
  display: inline-block;
  margin: 4px 4px 4px 0;
}
</style>
