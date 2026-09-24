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
          title: "A highlighted element",
          description: "A step points at an element, given as a selector, an element or a function.",
        },
      },
      {
        element: ".VPHero .image-container",
        popover: {
          title: "The default popover",
          description: "This is the default popover. Each of its parts can be replaced with a slot.",
          side: "left",
        },
      },
      {
        element: ".VPFeatures .items > :nth-child(1)",
        popover: {
          title: "Custom rendering",
          description: "Use slots, a component per step, or render the tour from its state.",
          side: "top",
        },
      },
      {
        popover: {
          title: "A centered step",
          description: "A step without an element is shown in the middle of the screen.",
        },
      },
    ],
  });
  driver.drive();
};
</script>

<template>
  <div class="hero-actions">
    <VPButton tag="button" theme="brand" text="Try it" @click="run" />
    <VPButton theme="alt" text="Get started" href="/guide/installation" />
    <VPButton theme="alt" text="Your own components" href="/styling/custom-components" />
  </div>
</template>

<style scoped>
/* Rendered after VitePress's own (empty) .actions block, so it repeats its
   layout: wrap on narrow screens, centered while the hero is stacked. */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

@media (min-width: 960px) {
  .hero-actions {
    justify-content: flex-start;
  }
}
</style>
