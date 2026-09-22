# Animated Tour

A tour with a few steps. Click the button under the box to see it in action.

<Demo
  id="animated-tour"
  title="Basic animated tour"
  :config="{ animate: true, showProgress: true, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#animated-tour .demo-box', popover: { title: 'Animated tour example', description: 'Here is the code example showing an animated tour. Let\'s walk you through it.', side: 'left', align: 'start' } },
    { element: '#anim-title', popover: { title: 'Import the library', description: 'It works the same with useDriver in a component or createDriver anywhere.', side: 'bottom', align: 'start' } },
    { element: '#anim-summary', popover: { title: 'Import the CSS', description: 'driver-vue/style.css gives you the default look for the popover and overlay.', side: 'bottom', align: 'start' } },
    { element: '#anim-search', popover: { title: 'Create a driver', description: 'Call useDriver with your steps to create an instance.', side: 'top', align: 'start' } },
    { element: '#anim-export', popover: { title: 'Start the tour', description: 'Call drive() and the tour starts.', side: 'right', align: 'start' } },
    { popover: { title: 'Happy coding', description: 'And that is all, go ahead and start adding tours to your applications.' } },
  ]"
>
  <DemoBox prefix="anim" />
</Demo>

```vue
<script setup lang="ts">
import { useDriver } from "driver-vue";
import "driver-vue/style.css";

const { drive } = useDriver({
  showProgress: true,
  steps: [
    { element: "#example", popover: { title: "Animated tour example", description: "Let's walk you through it.", side: "left", align: "start" } },
    { element: "#title", popover: { title: "Import the library", description: "It works the same with useDriver in a component or createDriver anywhere.", side: "bottom", align: "start" } },
    { element: "#summary", popover: { title: "Import the CSS", description: "driver-vue/style.css gives you the default look.", side: "bottom", align: "start" } },
    { element: "#search", popover: { title: "Create a driver", description: "Call useDriver with your steps.", side: "top", align: "start" } },
    { element: "#export", popover: { title: "Start the tour", description: "Call drive() and the tour starts.", side: "right", align: "start" } },
    { popover: { title: "Happy coding", description: "And that is all, go ahead and start adding tours to your applications." } },
  ],
});
</script>

<template>
  <button @click="drive()">Start</button>
</template>
```

## Animation duration

`duration` controls how long the transition takes, in milliseconds: the highlight sliding between steps and the overlay/popover fade-in. It only applies when `animate` is `true` and defaults to `400`.

<Demo
  id="duration-fast"
  title="Fast animation"
  :config="{ animate: true, duration: 150, showProgress: true, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#fast-title', popover: { title: 'Fast', description: 'Notice how quickly the highlight snaps over to this element.', side: 'bottom', align: 'start' } },
    { element: '#fast-search', popover: { title: 'Snappy popover', description: 'The popover fades in almost instantly at this speed.', side: 'top', align: 'start' } },
    { element: '#fast-export', popover: { title: 'Fast duration', description: 'A low duration makes the whole tour feel snappy.', side: 'right', align: 'start' } },
  ]"
>
  <DemoBox prefix="fast" />
</Demo>

```ts
const { drive } = useDriver({
  // Speed the whole transition up to 150ms (default is 400ms)
  duration: 150,
  showProgress: true,
  steps: [/* ... */],
});
```

<Demo
  id="duration-slow"
  title="Slow animation"
  :config="{ animate: true, duration: 1200, showProgress: true, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#slow-title', popover: { title: 'Slow', description: 'Notice how slowly the highlight glides over to this element.', side: 'bottom', align: 'start' } },
    { element: '#slow-search', popover: { title: 'Relaxed popover', description: 'The popover fade-in runs over the same duration as the slide.', side: 'top', align: 'start' } },
    { element: '#slow-export', popover: { title: 'Slow duration', description: 'This is the duration option that controls the whole transition.', side: 'right', align: 'start' } },
  ]"
>
  <DemoBox prefix="slow" />
</Demo>

```ts
const { drive } = useDriver({
  // Slow the whole transition down to 1200ms (default is 400ms)
  duration: 1200,
  showProgress: true,
  steps: [/* ... */],
});
```

To change the easing curve or decorate the moving cutout, see [Highlight Animation](../styling/highlight-animation).
