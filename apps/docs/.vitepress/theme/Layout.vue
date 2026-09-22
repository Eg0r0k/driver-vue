<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { DriverTour } from "driver-vue";
import TryItButton from "./components/TryItButton.vue";

// The shared driver installed by DriverPlugin renders here, once, for every
// <Demo> on every page. DriverTour renders nothing until mounted, so it is
// safe under VitePress SSR. The home hero gets a "Try it" button that runs a
// tour over the page.
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-actions-before>
      <TryItButton />
    </template>
  </Layout>
  <DriverTour />
</template>
