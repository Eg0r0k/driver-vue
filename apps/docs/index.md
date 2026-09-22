---
layout: home

hero:
  name: driver-vue
  text: Product tours, highlights and hints for Vue 3 and Nuxt 4
  tagline: A port of driver.js whose popover, overlay and beacons are Vue components. Same API, same class names, your own markup.
  actions:
    - theme: brand
      text: Get started
      link: /guide/installation
    - theme: alt
      text: Custom components
      link: /styling/custom-components
    - theme: alt
      text: Migrating from driver.js
      link: /guide/migrating-from-driverjs

features:
  - title: driver.js, unchanged
    details: The same Config, DriveStep, Popover, hooks and Driver methods. A tour written for driver.js runs as-is.
  - title: Style it your way
    details: CSS variables, the driver.js class names, slots for every part of the popover, a component per step, or go fully headless.
  - title: Animated highlight, your rules
    details: Pluggable easing, Vue transition classes for the popover and overlay, and a decoratable stage box that tracks the cutout.
  - title: Vue 3 and Nuxt 4
    details: A composable, a plugin, SSR-safe components and a Nuxt module with auto-imports.
---

<script setup>
import { onMounted } from "vue";
</script>

## Try it

<Demo
  button-text="Run a tour on this page"
  :config="{ showProgress: true }"
  :steps="[
    { element: '.VPHero .name', popover: { title: 'Highlight anything', description: 'Any element on the page, by selector, element or function.' } },
    { element: '.VPFeatures .items > :nth-child(2)', popover: { title: 'Style it', description: 'CSS variables, class names, slots, components or headless.', side: 'top' } },
    { popover: { title: 'Done', description: 'That was driver-vue. Read on for the guides.' } },
  ]"
  :box="false"
/>
