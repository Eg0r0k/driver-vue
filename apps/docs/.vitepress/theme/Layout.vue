<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { DriverTour } from "driver-vue";

// The shared driver installed by DriverPlugin renders here, once, for every
// <Demo> on every page. DriverTour renders nothing until mounted, so it is
// safe under VitePress SSR.
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout />
  <DriverTour />
</template>
