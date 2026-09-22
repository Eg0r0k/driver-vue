<script setup lang="ts">
import { multiPageSteps } from "~/examples/multi-page";

/** The mock app's own navigation, plus the button that starts the tour. */
const { start, progress } = useMultiPageTourControls(multiPageSteps);

const links = [
  { id: "mp-nav-dashboard", to: "/multi-page/dashboard", title: "Dashboard" },
  { id: "mp-nav-settings", to: "/multi-page/settings", title: "Settings" },
  { id: "mp-nav-profile", to: "/multi-page/profile", title: "Profile" },
];
</script>

<template>
  <nav class="mp-nav">
    <span class="mp-brand">Acme</span>

    <div class="mp-nav-links">
      <NuxtLink
        v-for="link in links"
        :id="link.id"
        :key="link.to"
        :to="link.to"
        class="mp-nav-link"
        active-class="mp-nav-current"
      >
        {{ link.title }}
      </NuxtLink>
    </div>

    <button id="mp-start" type="button" class="demo-button" :disabled="progress.active" @click="start">
      {{ progress.active ? "Tour running…" : "Start the multi-page tour" }}
    </button>
  </nav>
</template>
