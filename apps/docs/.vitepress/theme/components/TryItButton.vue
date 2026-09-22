<script setup lang="ts">
import { injectDriver } from "driver-vue";

const shared = injectDriver({ optional: true });

const run = () => {
  const driver = shared?.value;
  if (!driver) {
    return;
  }

  driver.destroy();
  driver.setConfig({
    showProgress: true,
    steps: [
      {
        element: ".VPHero .name",
        popover: {
          title: "Highlight anything",
          description: "Any element on the page, by selector, element or function.",
        },
      },
      {
        element: ".VPHero .image-container",
        popover: {
          title: "Your components",
          description: "This popover is the default one; every part is a slot.",
          side: "left",
        },
      },
      {
        element: ".VPFeatures .items > :nth-child(1)",
        popover: {
          title: "Render it yourself",
          description: "Slots, a component per step, or fully headless.",
          side: "top",
        },
      },
      { popover: { title: "That was driver-vue", description: "Read on for the guides, or open the examples." } },
    ],
  });
  driver.drive();
};
</script>

<template>
  <div class="action">
    <button type="button" class="VPButton medium brand try-it" @click="run">▶ Try it</button>
  </div>
  <div class="action">
    <a class="VPButton medium alt" href="/guide/installation">Get started</a>
  </div>
  <div class="action">
    <a class="VPButton medium alt" href="/styling/custom-components">Your own components</a>
  </div>
</template>

<style scoped>
.try-it {
  cursor: pointer;
  font-family: inherit;
}
</style>
