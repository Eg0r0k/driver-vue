# Tour Progress

Use `showProgress` to show the progress of the tour in the footer of the popover, and `progressText` to customize the text.

`showProgress` is `false` by default. The default `progressText` is `{{current}} of {{total}}`; use `{{current}}` and `{{total}}` in your own template.

<Demo
  id="progress-demo"
  :config="{ showProgress: true, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#progress-demo .demo-box', popover: { title: 'Progress example', description: 'Notice the text at the bottom left of the popover showing the progress.', side: 'left', align: 'start' } },
    { element: '#prog-title', popover: { title: 'Step two', description: 'The counter updates as you move.', side: 'bottom', align: 'start' } },
    { element: '#prog-search', popover: { title: 'Step three', description: 'It counts every step, including skipped ones.', side: 'top', align: 'start' } },
    { element: '#prog-export', popover: { title: 'Step four', description: 'Last one.', side: 'right', align: 'start' } },
  ]"
>
  <DemoBox prefix="prog" />
</Demo>

```ts
const { drive } = useDriver({
  showProgress: true,
  showButtons: ["next", "previous"],
  steps: [/* ... */],
});
```

<Demo
  id="progress-text"
  button-text="Different progress text"
  :config="{ stagePadding: 5, progressText: 'Step {{current}} of {{total}}', showProgress: true, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#progress-text .demo-box', popover: { title: 'progressText', description: 'You can use progressText to modify the progress text template.', side: 'left', align: 'start' } },
    { element: '#ptext-title', popover: { title: 'Step two', description: 'The template applies to every step.', side: 'bottom', align: 'start' } },
    { element: '#ptext-export', popover: { title: 'Step three', description: 'Last one.', side: 'right', align: 'start' } },
  ]"
>
  <DemoBox prefix="ptext" />
</Demo>

```ts
const { drive } = useDriver({
  progressText: "Step {{current}} of {{total}}",
  showProgress: true,
  steps: [/* ... */],
});
```

## Your own progress indicator

The `#progress` slot of `<DriverTour>` replaces the text with anything: dots, a bar, a fraction.

```vue
<DriverTour>
  <template #progress="{ index, total }">
    <span class="dots">
      <i v-for="i in total" :key="i" :class="{ active: i - 1 <= index }" />
    </span>
  </template>
</DriverTour>
```

See [Custom Components](../styling/custom-components).
