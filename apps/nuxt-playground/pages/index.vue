<script setup lang="ts">
import { basicTourSteps } from "~/examples/shared";

useHead({ title: "driver-vue playground" });

// The shared driver from the module plugin, rendered by the <DriverTour /> in the layout.
const { drive } = useDriver({ steps: basicTourSteps, showProgress: true }, { shared: true });
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>driver-vue playground</h2>
      <p class="fx-hint">
        Every example from the driver.js documentation and playground, ported to Vue, plus the pages that only
        driver-vue can do: animating the highlight box, slots and custom components, hints, a tour across Nuxt pages.
        Pick a group on the left. Hooks and events are written to the log on the right instead of the console.
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="drive()">Start the basic tour</button>
        <NuxtLink to="/animation" class="demo-button">Animate the highlight box</NuxtLink>
      </div>
    </section>

    <Stage />
  </div>
</template>
