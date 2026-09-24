# Simple Highlight

`highlight()` dims the page around one element and shows a popover next to it, without a tour. Use it for contextual help, form guidance or a feature announcement. The popover has no buttons; Escape or a click on the overlay closes it.

<Demo
  id="highlight-demo"
  :highlight="{ element: '#hl-search', popover: { title: 'Project name', description: 'The name is shown in the sidebar and in every export.' } }"
>
  <DemoBox prefix="hl" />
</Demo>

```ts
const { highlight } = useDriver();

highlight({
  element: "#project-name",
  popover: {
    title: "Project name",
    description: "The name is shown in the sidebar and in every export.",
  },
});
```

To add buttons to a highlight, see [Popover Buttons](./buttons).

## A popover without an element

Leave out `element` and the popover is centered over the dimmed page, like a modal. The description is HTML, so it can hold a list, a link or an image.

<Demo
  :box="false"
  :highlight="{ popover: { title: 'New in this release', description: 'Projects can now be exported as PDF.<br>Open the Export menu to try it.' } }"
/>

```ts
highlight({
  popover: {
    title: "New in this release",
    description: "Projects can now be exported as PDF.<br>Open the Export menu to try it.",
  },
});
```

## Contextual form help

Focus a field below: the field is highlighted with a hint about what to enter, and leaving the field closes it. The demo is a component with its own driver, so it renders its own `<DriverTour>` (see [Basic Usage](../guide/basic-usage) for which driver a `<DriverTour />` renders).

<FormHelpDemo />

```vue
<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

const { highlight, destroy } = useDriver({
  stagePadding: 0,
  // After Escape or an overlay click, blur the field
  // so that focusing it again shows the popover.
  onDestroyed: () => (document.activeElement as HTMLElement | null)?.blur(),
});

function onFocus(event: FocusEvent, title: string, description: string) {
  highlight({ element: event.target as Element, popover: { title, description } });
}
</script>

<template>
  <form @focusout="destroy()">
    <input placeholder="Name" @focus="onFocus($event, 'Name', 'Your full name, as it appears on invoices.')" />
    <input placeholder="Email" @focus="onFocus($event, 'Email', 'Used for sign-in and receipts.')" />
    <input placeholder="Company" @focus="onFocus($event, 'Company', 'Optional. Leave empty for a personal account.')" />
    <button type="submit">Submit</button>
    <DriverTour />
  </form>
</template>
```
