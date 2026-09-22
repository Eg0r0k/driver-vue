<script setup lang="ts">
import { VPButton } from "vitepress/theme";
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
  <div style="display: flex; gap: 8px">
    <div class="action">
      <VPButton tag="button" theme="brand" text="Try it" @click="run" />
    </div>
    <div class="action">
      <VPButton theme="alt" text="Get started" href="/guide/installation" />
    </div>
    <div class="action">
      <VPButton theme="alt" text="Your own components" href="/styling/custom-components" />
    </div>
  </div>
</template>
