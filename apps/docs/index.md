---
layout: home

hero:
  name: driver-vue
  text: Product tours you render with your own Vue components
  tagline: A port of driver.js whose popover, overlay, stage and hint beacons are Vue components. Same API, same class names, your markup.
  actions:
    - theme: brand
      text: Render it yourself
      link: /styling/custom-components
    - theme: alt
      text: Get started
      link: /guide/installation
    - theme: alt
      text: Migrating from driver.js
      link: /guide/migrating-from-driverjs

features:
  - title: Your components, not ours
    details: Replace one part of the popover with a slot, the whole body with your own component, or render the entire tour yourself from the reactive state.
  - title: driver.js, unchanged
    details: The same Config, DriveStep, Popover, hooks and Driver methods. A tour written for driver.js runs as-is.
  - title: Defaults worth keeping
    details: The driver.js look ships as CSS custom properties and the original class names, so restyling is a handful of variables when you do not want custom markup.
  - title: Vue 3 and Nuxt 4
    details: A composable, a plugin, SSR-safe components, pluggable easing and a Nuxt module with auto-imports.
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
    { element: '.VPFeatures .items > :nth-child(1)', popover: { title: 'Render it yourself', description: 'Slots, a component per step, or fully headless.', side: 'top' } },
    { popover: { title: 'Done', description: 'That was driver-vue. Read on for the guides.' } },
  ]"
  :box="false"
/>
