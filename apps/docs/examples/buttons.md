# Popover Buttons

Use `showButtons` to choose which buttons to show in the popover. The default is `["next", "previous", "close"]` for a tour and `[]` for a single `highlight`.

<div id="driver-note" class="tip custom-block">
<p class="custom-block-title">NOTE</p>
<p>When using <code>highlight</code> for a single element, no button is shown. <code>showButtons</code> can add them, but the next and previous buttons do nothing in a bare highlight until you give them <code>onNextClick</code> / <code>onPrevClick</code> callbacks.</p>
</div>

<Demo inline button-text="Show all buttons" :config="{ showButtons: ['next', 'previous', 'close'] }" :steps="[
  { element: '#driver-note', popover: { title: 'Popover title', description: 'Popover description' } },
  { element: '#driver-note code', popover: { title: 'Popover title', description: 'Popover description' } },
]" />
<Demo inline button-text="No close button" :config="{ showButtons: ['next', 'previous'] }" :steps="[
  { element: '#driver-note', popover: { title: 'Popover title', description: 'Popover description' } },
  { element: '#driver-note code', popover: { title: 'Popover title', description: 'Popover description' } },
]" />
<Demo inline button-text="No buttons (use arrows)" :config="{ showButtons: [] }" :steps="[
  { element: '#driver-note', popover: { title: 'Popover title', description: 'Use the arrow keys and Escape.' } },
  { element: '#driver-note code', popover: { title: 'Popover title', description: 'Popover description', side: 'bottom', align: 'start' } },
]" />

```ts
const { drive } = useDriver({
  showButtons: ["next", "previous", "close"],
  steps: [
    { element: "#first-element", popover: { title: "Popover title", description: "Popover description" } },
    { element: "#second-element", popover: { title: "Popover title", description: "Popover description" } },
  ],
});
```

## Change button text

Change the text of the buttons with `nextBtnText`, `prevBtnText` and `doneBtnText` (globally or per step). The texts are HTML, so entities and icons work.

<Demo
  id="button-text"
  button-text="Change button text"
  :config="{ showProgress: true, nextBtnText: '—›', prevBtnText: '‹—', doneBtnText: '✕' }"
  :steps="[
    { element: '#button-text .demo-box', popover: { title: 'Popover title', description: 'Popover description' } },
    { element: '#btntext-export', popover: { title: 'Popover title', description: 'Popover description', side: 'right' } },
  ]"
>
  <DemoBox prefix="btntext" />
</Demo>

```ts
const { drive } = useDriver({
  nextBtnText: "—›",
  prevBtnText: "‹—",
  doneBtnText: "✕",
  showProgress: true,
  steps: [/* ... */],
});
```

## Event handlers

Use the `onNextClick`, `onPrevClick`, `onCloseClick` and `onDoneClick` callbacks to implement custom behavior for the buttons.

> When you configure these callbacks, the default behavior of the buttons is disabled: you move the tour yourself.

> `onDoneClick` runs when the done button (the next button on the last step) is clicked, instead of `onNextClick`. The tour is not torn down for you; call `driver.destroy()`.

<EventLogDemo />

```ts
const { drive, driver } = useDriver({
  onNextClick: () => {
    console.log("Next button clicked");
    driver.moveNext();
  },
  onPrevClick: () => {
    console.log("Previous button clicked");
    driver.movePrevious();
  },
  onCloseClick: () => {
    console.log("Close button clicked");
    driver.destroy();
  },
  onDoneClick: () => {
    console.log("Done button clicked");
    driver.destroy();
  },
  steps: [/* ... */],
});
```

## Custom buttons

Two ways. The Vue way is a slot: `#footer` replaces the whole footer, `#prev` / `#next` a single button, and every slot receives `next`, `prev`, `close` plus the tour scope.

```vue
<DriverTour>
  <template #footer="{ index, total, isFirst, isLast, next, prev, driver }">
    <footer class="driver-popover-footer">
      <span>{{ index + 1 }}/{{ total }}</span>
      <MyButton variant="ghost" @click="driver.drive(0)">Go to first</MyButton>
      <MyButton :disabled="isFirst" @click="prev">Back</MyButton>
      <MyButton @click="next">{{ isLast ? "Done" : "Next" }}</MyButton>
    </footer>
  </template>
</DriverTour>
```

The driver.js way still works: `onPopoverRender` receives the popover DOM and you append what you like.

<CustomButtonDemo />

```ts
const { drive, driver } = useDriver({
  onPopoverRender: (popover, { config, state }) => {
    const firstButton = document.createElement("button");
    // driver-popover-footer-btn gives the button the default styling.
    firstButton.className = "driver-popover-footer-btn";
    firstButton.innerText = "Go to first";
    popover.footerButtons?.prepend(firstButton);

    firstButton.addEventListener("click", () => driver.drive(0));
  },
  steps: [/* ... */],
});
```

See [Custom Components](../styling/custom-components) for the full slot list.
