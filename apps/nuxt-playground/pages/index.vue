<script setup lang="ts">
import type { DriveStep } from "driver-vue";
import CustomPopover from "~/components/CustomPopover.vue";

const steps: DriveStep[] = [
  { element: "#hero", popover: { title: "Welcome", description: "This page is driven by the Nuxt module." } },
  { element: "#features", popover: { title: "Features", description: "Every part of the tour is a Vue component." } },
  { element: "#cta", popover: { title: "Try it", description: "Run the tour again, or the custom one." } },
];

// The shared driver from the module plugin: rendered by <DriverTour /> in app.vue.
const shared = useDriver({ steps }, { shared: true });

// A second, local driver rendered by the <DriverTour> below with a custom
// popover component through the #popover slot.
const local = useDriver({ steps, animate: false, allowClose: true });
</script>

<template>
  <main>
    <section id="hero">
      <h1>nuxt-driver-vue playground</h1>
      <p>A tiny page to exercise the module: auto-imported composables, registered components and SSR safety.</p>
    </section>

    <section id="features">
      <h2>Features</h2>
      <ul>
        <li>Composables are auto-imported (<code>useDriver</code>).</li>
        <li>Components are registered globally (<code>&lt;DriverTour /&gt;</code>).</li>
        <li>The tour renders nothing on the server.</li>
      </ul>
    </section>

    <section id="cta" class="actions">
      <button type="button" @click="shared.drive()">Start shared tour</button>
      <button type="button" @click="local.drive()">Start custom-popover tour</button>
    </section>

    <DriverTour :driver="local.driver">
      <template #popover="props">
        <CustomPopover v-bind="props" />
      </template>
    </DriverTour>
  </main>
</template>

<style scoped>
section {
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
</style>
