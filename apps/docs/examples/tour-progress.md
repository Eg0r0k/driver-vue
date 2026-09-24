# Tour Progress

`showProgress: true` shows the position in the tour, such as "2 of 3", on the left of the popover footer. It is `false` by default.

<Demo
  id="progress-demo"
  :config="{ showProgress: true }"
  :steps="[
    { element: '#prog-title', popover: { title: 'Progress', description: 'The footer shows 1 of 3.' } },
    { element: '#prog-search', popover: { title: 'Progress', description: 'The count goes up with each step.' } },
    { element: '#prog-export', popover: { title: 'Progress', description: 'On the last step it reads 3 of 3.', side: 'right' } },
  ]"
>
  <DemoBox prefix="prog" />
</Demo>

```ts
const { drive } = useDriver({
  showProgress: true,
  steps: [/* ... */],
});
```

The total is the length of `steps`, so steps skipped with `skipMissingElement` are still counted.

## Progress text

`progressText` is the template of the text. <code v-pre>{{current}}</code> is replaced with the step number and <code v-pre>{{total}}</code> with the number of steps. The default is <code v-pre>{{current}} of {{total}}</code>.

<Demo
  id="progress-text-demo"
  :config="{ showProgress: true, progressText: 'Step {{current}} of {{total}}' }"
  :steps="[
    { element: '#ptext-title', popover: { title: 'Progress text', description: 'progressText is set to Step {{current}} of {{total}}.' } },
    { element: '#ptext-export', popover: { title: 'Progress text', description: 'The same template is used on every step.', side: 'right' } },
  ]"
>
  <DemoBox prefix="ptext" />
</Demo>

```ts
const { drive } = useDriver({
  showProgress: true,
  progressText: "Step {{current}} of {{total}}",
  steps: [/* ... */],
});
```

Both options are also accepted in a step's `popover`, to turn the progress on or change the text for that step only. To draw the progress as dots or a bar, replace it with the `#progress` slot of `<DriverTour>`, described in [Custom Components](../styling/custom-components).
