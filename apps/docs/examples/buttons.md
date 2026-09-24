# Popover Buttons

`showButtons` lists the buttons the popover shows: any of `"next"`, `"previous"` and `"close"`. The default is all three in a tour and none in a `highlight()`. With no buttons the tour can still be moved with the arrow keys and closed with Escape.

<div class="demo">
<DemoBox prefix="show">
<template #footer>
<Demo
  inline
  button-text="All buttons"
  :config="{ showButtons: ['next', 'previous', 'close'] }"
  :steps="[
    { element: '#show-title', popover: { title: 'All buttons', description: 'Next, Previous and the close button.' } },
    { element: '#show-export', popover: { title: 'All buttons', description: 'The last step shows Done in place of Next.', side: 'right' } },
  ]"
/>
<Demo
  inline
  button-text="No close button"
  :config="{ showButtons: ['next', 'previous'] }"
  :steps="[
    { element: '#show-title', popover: { title: 'No close button', description: 'Escape still closes the tour.' } },
    { element: '#show-export', popover: { title: 'No close button', description: 'Done ends the tour.', side: 'right' } },
  ]"
/>
<Demo
  inline
  button-text="No buttons"
  :config="{ showButtons: [] }"
  :steps="[
    { element: '#show-title', popover: { title: 'No buttons', description: 'Press the right arrow key to go on.' } },
    { element: '#show-export', popover: { title: 'No buttons', description: 'Left arrow goes back, Escape closes.', side: 'right' } },
  ]"
/>
</template>
</DemoBox>
</div>

```ts
const { drive } = useDriver({
  showButtons: ["next", "previous"],
  steps: [/* ... */],
});
```

`showButtons` can also be set per step in `popover`. `disableButtons` takes the same values and shows those buttons disabled. The close button is never shown when `allowClose` is `false` (see [Exiting the Tour](./exiting)).

In a `highlight()`, the close button works as in a tour, but next and previous do nothing until you give them the `onNextClick` and `onPrevClick` hooks described below.

## Button text

`nextBtnText`, `prevBtnText` and `doneBtnText` change the labels (defaults: "Next", "Previous" and "Done"). The done text replaces the next text on the last step. They can be set for the whole tour or per step in `popover`. The texts are HTML, so they can contain entities or an icon.

<Demo
  id="button-text"
  :config="{ nextBtnText: 'Continue', prevBtnText: 'Back', doneBtnText: 'Finish' }"
  :steps="[
    { element: '#btntext-title', popover: { title: 'Button text', description: 'Next is labelled Continue and Previous is labelled Back.' } },
    { element: '#btntext-export', popover: { title: 'Button text', description: 'On the last step the button reads Finish.', side: 'right' } },
  ]"
>
  <DemoBox prefix="btntext" />
</Demo>

```ts
const { drive } = useDriver({
  nextBtnText: "Continue",
  prevBtnText: "Back",
  doneBtnText: "Finish",
  steps: [/* ... */],
});
```

## Click hooks

`onNextClick`, `onPrevClick`, `onCloseClick` and `onDoneClick` run when the matching button is clicked. `onDoneClick` is for the next button on the last step; without it, `onNextClick` runs there too.

A hook replaces the default action of its button. The tour does not move or close by itself any more, so call `driver.moveNext()`, `driver.movePrevious()` or `driver.destroy()` from the hook when you want that to happen. On the last step, `driver.moveNext()` ends the tour.

`onNextClick` and `onPrevClick` also run for the right and left arrow keys, and `onNextClick` for `advanceOnClick` and for `overlayClickBehavior: "nextStep"`. Escape does not call `onCloseClick`. All four hooks can be set for the whole tour or per step in `popover`, where the step's hook wins.

<EventLogDemo />

```ts
const { drive, driver } = useDriver({
  onNextClick: () => {
    console.log("onNextClick");
    driver.moveNext();
  },
  onPrevClick: () => {
    console.log("onPrevClick");
    driver.movePrevious();
  },
  onCloseClick: () => {
    console.log("onCloseClick");
    driver.destroy();
  },
  onDoneClick: () => {
    console.log("onDoneClick");
    driver.destroy();
  },
  steps: [/* ... */],
});
```

A hook can also wait before moving on, for example for a request to finish; see [Async Tour](./async-tour).

## Custom buttons

In Vue, replace the footer with the `#footer` slot of `<DriverTour>`, or a single button with `#prev` or `#next`. The slots receive `next`, `prev` and `close`, which run the same actions and hooks as the default buttons, plus the tour state.

```vue
<DriverTour>
  <template #footer="{ index, total, isFirst, isLast, next, prev, driver }">
    <footer class="driver-popover-footer">
      <span>{{ index + 1 }}/{{ total }}</span>
      <MyButton variant="ghost" @click="driver.moveTo(0)">Go to first</MyButton>
      <MyButton :disabled="isFirst" @click="prev">Back</MyButton>
      <MyButton @click="next">{{ isLast ? "Done" : "Next" }}</MyButton>
    </footer>
  </template>
</DriverTour>
```

The full list of slots and their props is in [Custom Components](../styling/custom-components).

The driver.js way works too: `onPopoverRender` receives the popover DOM each time a popover is shown, and you can add elements to it.

<CustomButtonDemo />

```ts
const { drive, driver } = useDriver({
  onPopoverRender: popover => {
    const firstButton = document.createElement("button");
    // The default button styling.
    firstButton.className = "driver-popover-footer-btn";
    firstButton.innerText = "Go to first";
    firstButton.addEventListener("click", () => driver.moveTo(0));
    popover.footerButtons?.prepend(firstButton);
  },
  steps: [/* ... */],
});
```
