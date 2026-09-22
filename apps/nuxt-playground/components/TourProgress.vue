<script setup lang="ts">
import { multiPageSteps } from "~/examples/multi-page";

/**
 * The bar the layout shows while the multi-page tour runs: how far along the
 * whole flow is, which page the current step belongs to, and a way out.
 */
const { progress, stop } = useMultiPageTourControls(multiPageSteps);

const pageTitle = computed(() => {
  const name = progress.value.page.split("/").filter(Boolean).pop() ?? "";
  return name.charAt(0).toUpperCase() + name.slice(1);
});

const percent = computed(() =>
  progress.value.total ? Math.round(((progress.value.index + 1) / progress.value.total) * 100) : 0
);
</script>

<template>
  <div v-if="progress.active" class="tour-bar" role="status">
    <p class="tour-bar-label">
      Multi-page tour · step {{ progress.index + 1 }} of {{ progress.total }}
      <template v-if="pageTitle"> · {{ pageTitle }}</template>
    </p>

    <div
      class="tour-bar-track"
      role="progressbar"
      :aria-valuenow="progress.index + 1"
      aria-valuemin="1"
      :aria-valuemax="progress.total"
    >
      <div class="tour-bar-fill" :style="{ width: `${percent}%` }" />
    </div>

    <button type="button" class="tour-bar-stop" @click="stop">Stop</button>
  </div>
</template>
