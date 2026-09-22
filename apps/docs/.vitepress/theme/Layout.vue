<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { DriverTour } from "driver-vue";
import TryItButton from "./components/TryItButton.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-actions-after>
      <TryItButton />
    </template>
  </Layout>
  <DriverTour />
</template>
