# Prevent Tour Exit

Prevent the user from exiting the tour with `allowClose: false`. This is useful when the user must complete the tour before continuing.

In the example below you cannot exit the tour until you reach the last step: Escape, overlay clicks and the close button are ignored (the close button is not even rendered).

<Demo
  id="prevent-exit"
  title="Prevent exit"
  :config="{ animate: true, showProgress: true, allowClose: false, showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#prevent-exit .demo-box', popover: { title: 'No way out', description: 'Escape and overlay clicks do nothing; the close button is hidden.', side: 'left', align: 'start' } },
    { element: '#prevent-title', popover: { title: 'Keep going', description: 'Use next to move on.', side: 'bottom', align: 'start' } },
    { element: '#prevent-export', popover: { title: 'Almost there', description: 'One more.', side: 'right', align: 'start' } },
    { popover: { title: 'Happy coding', description: 'The done button ends the tour.' } },
  ]"
>
  <DemoBox prefix="prevent" />
</Demo>

```ts
const { drive } = useDriver({
  showProgress: true,
  allowClose: false,
  steps: [
    { element: "#example", popover: { title: "No way out", description: "Escape and overlay clicks do nothing.", side: "left", align: "start" } },
    { element: "#title", popover: { title: "Keep going", description: "Use next to move on.", side: "bottom", align: "start" } },
    { element: "#export", popover: { title: "Almost there", description: "One more.", side: "right", align: "start" } },
    { popover: { title: "Happy coding", description: "The done button ends the tour." } },
  ],
});
```

To allow exiting but ask first, see [Confirm on Exit](./confirm-on-exit). To advance on overlay clicks instead of closing, set `overlayClickBehavior: "nextStep"`.
