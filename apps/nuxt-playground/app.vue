<script setup lang="ts">
// <DriverTour /> without a driver prop renders the shared instance installed
// by the module's plugin; `useDriver(config, { shared: true })` drives it.
</script>

<template>
  <div class="app">
    <NuxtPage />
    <DriverTour />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #1f2937;
}

.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
