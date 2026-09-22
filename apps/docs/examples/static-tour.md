# Static Tour

Set `animate` to `false` to make the tour static: no slide between steps, no fades. The popover and the cutout jump from one element to the next.

<Demo
  id="static-tour"
  title="Basic static tour"
  :config="{ animate: false, showProgress: false, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#static-tour .demo-box', popover: { title: 'Static tour example', description: 'Here is the code example showing a static tour. Let\'s walk you through it.', side: 'left', align: 'start' } },
    { element: '#static-title', popover: { title: 'No slide', description: 'The cutout jumps straight to the next element.', side: 'bottom', align: 'start' } },
    { element: '#static-search', popover: { title: 'No fade', description: 'The popover appears immediately.', side: 'top', align: 'start' } },
    { element: '#static-export', popover: { title: 'Same everything else', description: 'Keyboard, hooks and buttons work the same.', side: 'right', align: 'start' } },
    { popover: { title: 'Happy coding', description: 'And that is all, go ahead and start adding tours to your applications.' } },
  ]"
>
  <DemoBox prefix="static" />
</Demo>

```ts
const { drive } = useDriver({
  animate: false,
  showProgress: false,
  showButtons: ["next", "previous", "close"],
  steps: [
    { element: "#example", popover: { title: "Static tour example", description: "Let's walk you through it.", side: "left", align: "start" } },
    { element: "#title", popover: { title: "No slide", description: "The cutout jumps straight to the next element.", side: "bottom", align: "start" } },
    { element: "#search", popover: { title: "No fade", description: "The popover appears immediately.", side: "top", align: "start" } },
    { element: "#export", popover: { title: "Same everything else", description: "Keyboard, hooks and buttons work the same.", side: "right", align: "start" } },
    { popover: { title: "Happy coding", description: "And that is all, go ahead and start adding tours to your applications." } },
  ],
});

drive();
```

With `animate: false` the default transition classes do not apply (they are scoped to `.driver-fade`). Your own transition rules written without that guard still run; see [Highlight Animation](../styling/highlight-animation).
