# Exiting the Tour

By default the reader can leave a tour at any step: with Escape, the close button or a click on the dimmed overlay. The done button on the last step ends it as well. The options on this page restrict or intercept that.

## Prevent closing

With `allowClose: false`, Escape and clicks on the overlay do nothing and the close button is not shown. The tour ends only with the done button on the last step, or when your code calls `driver.destroy()`.

<Demo
  id="prevent-exit"
  button-text="Run with allowClose: false"
  :config="{ allowClose: false }"
  :steps="[
    { element: '#prevent-title', popover: { title: 'No close button', description: 'Escape and overlay clicks are ignored.' } },
    { element: '#prevent-search', popover: { title: 'Step 2', description: 'Only Next and Previous are left.' } },
    { element: '#prevent-export', popover: { title: 'Last step', description: 'Done ends the tour.', side: 'right' } },
  ]"
>
  <DemoBox prefix="prevent" />
</Demo>

```ts
const { drive } = useDriver({
  allowClose: false,
  steps: [/* ... */],
});
```

## Overlay clicks

`overlayClickBehavior` decides what a click on the dimmed overlay does:

| Value | Effect |
| --- | --- |
| `"close"` (default) | Ends the tour. Does nothing when `allowClose` is `false`. |
| `"nextStep"` | Moves to the next step, or runs `onNextClick` if you set it. On the last step it ends the tour. |
| a function | Runs instead, with the same arguments as the other hooks: `(element, step, { config, state, driver, index })`. |

`"nextStep"` and a function also work when `allowClose` is `false`.

<Demo
  id="overlay-next"
  button-text='Run with overlayClickBehavior: "nextStep"'
  :config="{ overlayClickBehavior: 'nextStep' }"
  :steps="[
    { element: '#overlay-title', popover: { title: 'Click the overlay', description: 'A click anywhere on the dimmed page goes to the next step.' } },
    { element: '#overlay-search', popover: { title: 'Step 2', description: 'Click the overlay again.' } },
    { element: '#overlay-export', popover: { title: 'Last step', description: 'One more overlay click ends the tour.', side: 'right' } },
  ]"
>
  <DemoBox prefix="overlay" />
</Demo>

```ts
const { drive } = useDriver({
  overlayClickBehavior: "nextStep",
  steps: [/* ... */],
});
```

```ts
const { drive } = useDriver({
  // Go back to the first step.
  overlayClickBehavior: (element, step, { driver }) => driver.moveTo(0),
  steps: [/* ... */],
});
```

## Confirm before exit

`onDestroyStarted` runs when the tour is about to end: on Escape, the close button, an overlay click with `overlayClickBehavior: "close"`, the done button, and `scrollAwayBehavior: "close"`. When the hook is set, the tour does not end by itself; call `driver.destroy()` from the hook to end it. `driver.destroy()` does not run `onDestroyStarted` again.

The demo below asks for confirmation when you try to leave before the last step.

<ConfirmExitDemo />

```ts
const { drive, driver } = useDriver({
  onDestroyStarted: () => {
    if (!driver.hasNextStep() || confirm("Leave the tour?")) {
      driver.destroy();
    }
  },
  steps: [/* ... */],
});
```

To use your own dialog in place of `confirm()`, open it from the hook and call `driver.destroy()` when the reader confirms. The tour stays open until then.

```ts
const confirmExit = ref(false);

const { driver } = useDriver({
  onDestroyStarted: () => {
    if (!driver.hasNextStep()) {
      driver.destroy();
      return;
    }
    confirmExit.value = true;
  },
});

function leave() {
  confirmExit.value = false;
  driver.destroy();
}
```

While a tour runs, only the popover and the highlighted element receive clicks. Give the dialog the `driver-interactive` class so it can be clicked, and a `z-index` above the popover (the overlay is at `zIndex`, default `10000`, and the popover two above it). The class is described in [Headless](../styling/headless).
