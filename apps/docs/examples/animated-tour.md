# Animated Tour

Tours are animated by default (`animate: true`). Between two steps the highlight slides from one element to the next, and the popover of the new step fades in halfway through the slide.

<Demo
  id="animated-tour"
  :steps="[
    { element: '#anim-title', popover: { title: 'Title', description: 'The first step highlights the heading.' } },
    { element: '#anim-search', popover: { title: 'Name field', description: 'The highlight slid down from the heading.' } },
    { element: '#anim-export', popover: { title: 'Export button', description: 'And from the field to this button.', side: 'right' } },
  ]"
>
  <DemoBox prefix="anim" />
</Demo>

```ts
const { drive } = useDriver({
  steps: [
    { element: "#title", popover: { title: "Title", description: "The first step highlights the heading." } },
    { element: "#search", popover: { title: "Name field", description: "The highlight slid down from the heading." } },
    { element: "#export", popover: { title: "Export button", description: "And from the field to this button.", side: "right" } },
  ],
});

drive();
```

## Animation duration

`duration` is the length of the transition in milliseconds (default `400`). It sets both the slide between steps and the fade of the overlay and the popover. It has no effect when `animate` is `false`.

<div class="demo">
<DemoBox prefix="dur">
<template #footer>
<Demo
  inline
  button-text="Run with duration: 150"
  :config="{ duration: 150 }"
  :steps="[
    { element: '#dur-title', popover: { title: 'Fast', description: 'duration: 150' } },
    { element: '#dur-search', popover: { title: 'Fast', description: 'The slide takes 150 ms.' } },
    { element: '#dur-export', popover: { title: 'Fast', description: 'The slide takes 150 ms.', side: 'right' } },
  ]"
/>
<Demo
  inline
  button-text="Run with duration: 1200"
  :config="{ duration: 1200 }"
  :steps="[
    { element: '#dur-title', popover: { title: 'Slow', description: 'duration: 1200' } },
    { element: '#dur-search', popover: { title: 'Slow', description: 'The slide takes 1200 ms.' } },
    { element: '#dur-export', popover: { title: 'Slow', description: 'The slide takes 1200 ms.', side: 'right' } },
  ]"
/>
</template>
</DemoBox>
</div>

```ts
const { drive } = useDriver({
  duration: 150,
  steps: [/* ... */],
});
```

To change the easing curve or style the moving highlight, see [Highlight Animation](../styling/highlight-animation).

## Static tour

With `animate: false` nothing slides or fades: the highlight and the popover jump to the next element at once. Keyboard navigation, buttons and hooks work the same.

<Demo
  id="static-tour"
  button-text="Run with animate: false"
  :config="{ animate: false }"
  :steps="[
    { element: '#static-title', popover: { title: 'Title', description: 'animate: false' } },
    { element: '#static-search', popover: { title: 'Name field', description: 'The highlight jumped here without a slide.' } },
    { element: '#static-export', popover: { title: 'Export button', description: 'The popover appears without a fade.', side: 'right' } },
  ]"
>
  <DemoBox prefix="static" />
</Demo>

```ts
const { drive } = useDriver({
  animate: false,
  steps: [/* ... */],
});
```

The default fade rules are scoped to the `driver-fade` class, which a static tour does not set. Transition rules of your own that do not check for that class still run; see [Highlight Animation](../styling/highlight-animation).
