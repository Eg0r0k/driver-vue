# Confirm on Exit

Use the `onDestroyStarted` hook to add a confirmation dialog, or any other logic, when the user tries to exit the tour. In the example below we check whether steps are left and ask for confirmation before exiting.

<ConfirmExitDemo />

```ts
const { drive, driver } = useDriver({
  showProgress: true,
  steps: [
    { element: "#example", popover: { title: "Confirm on exit", description: "Try to leave before the last step.", side: "left", align: "start" } },
    { element: "#title", popover: { title: "Still here", description: "You confirmed you want to stay.", side: "bottom", align: "start" } },
    { popover: { title: "Last step", description: "On the last step the tour closes without asking." } },
  ],
  // onDestroyStarted is called when the user tries to exit the tour
  onDestroyStarted: () => {
    if (!driver.hasNextStep() || confirm("Are you sure?")) {
      driver.destroy();
    }
  },
});
```

> By overriding `onDestroyStarted` you are responsible for calling `driver.destroy()` to exit the tour. The hook runs for Escape, the close button, an overlay click with `overlayClickBehavior: "close"`, and the done button; it does not run for your own `driver.destroy()` calls (that would loop).

A Vue-flavoured version can open your own confirmation dialog instead of `confirm()`; the tour simply stays open until you call `destroy()`:

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
