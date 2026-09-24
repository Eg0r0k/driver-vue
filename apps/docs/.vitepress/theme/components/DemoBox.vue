<script setup lang="ts">
/**
 * The sample content demos point at: a small settings panel (heading, a line
 * of text, a field and two buttons). Every id is prefixed so several boxes can
 * live on one page: `<prefix>-box`, `-title`, `-summary`, `-search`,
 * `-export`, `-share`.
 *
 * Slots: `default` renders extra content under the buttons, `footer` renders
 * the demo's own controls under a divider.
 */
withDefaults(defineProps<{ prefix?: string }>(), { prefix: "demo" });
</script>

<template>
  <div :id="`${prefix}-box`" class="demo-box">
    <h4 :id="`${prefix}-title`" class="demo-box-title">Project settings</h4>
    <p :id="`${prefix}-summary`" class="demo-box-text">
      Sample content for the demo to highlight. None of these controls do anything.
    </p>
    <input :id="`${prefix}-search`" class="demo-input" type="text" placeholder="Project name" />
    <div class="demo-row">
      <button :id="`${prefix}-export`" type="button" class="demo-button">Export</button>
      <button :id="`${prefix}-share`" type="button" class="demo-button">Share</button>
    </div>
    <slot />
    <div v-if="$slots.footer" class="demo-box-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
