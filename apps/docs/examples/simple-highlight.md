# Simple Highlight

Product tours are not the only use case. Highlight any element on the page and show a popover with a description: contextual help, form guidance, a feature announcement.

<Demo
  id="highlight-me"
  button-text="Highlight me"
  :config="{ popoverClass: 'driverjs-theme', stagePadding: 4 }"
  :highlight="{ element: '#highlight-me .demo-box', popover: { side: 'bottom', title: 'This is a title', description: 'This is a description' } }"
>
  <p>Some content worth pointing at.</p>
</Demo>

```ts
const { highlight } = useDriver({
  popoverClass: "driverjs-theme",
  stagePadding: 4,
});

highlight({
  element: "#highlight-me",
  popover: {
    side: "bottom",
    title: "This is a title",
    description: "This is a description",
  },
});
```

## A modal without an element

Omit `element` to show a centered popover over the dimmed page.

<Demo
  button-text="Show popover"
  :box="false"
  :highlight="{ popover: { title: 'Yet another highlight', description: '<p style=\'margin:0\'>A centered popover, no element highlighted. The description is HTML, so it can carry an image, a list or anything else.</p>' } }"
/>

```ts
highlight({
  popover: {
    title: "Yet another highlight",
    description: "<p>A centered popover, no element highlighted.</p>",
  },
});
```

## Contextual form help

Focus a field below to see the popover follow it. This one is a small component with its own driver and `<DriverTour>`.

<FormHelpDemo />

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { highlight, destroy } = useDriver({
  popoverClass: "driverjs-theme",
  stagePadding: 0,
  onDestroyed: () => (document.activeElement as HTMLElement | null)?.blur(),
});

function onFocus(event: FocusEvent, title: string, description: string) {
  highlight({ element: event.target as Element, popover: { title, description } });
}
</script>

<template>
  <form @focusout="destroy()">
    <input placeholder="Enter your name" @focus="onFocus($event, 'Name', 'Enter your name here')" />
    <input placeholder="Your education" @focus="onFocus($event, 'Education', 'Enter your education here')" />
    <input placeholder="Your age" @focus="onFocus($event, 'Age', 'Enter your age here')" />
    <button type="submit">Submit</button>
    <DriverTour />
  </form>
</template>
```
