# Driver methods

The methods of a driver instance, as returned by `createDriver()` / `driver()` and exposed on `useDriver().driver`. They are the driver.js methods.

> Configuration options are omitted here; see [Configuration](../guide/configuration).

```ts
import { createDriver } from "driver-vue";

const driver = createDriver({
  /* ... */
});

// --------------------------------------------------
// driver is an object with the following methods
// --------------------------------------------------

// Start the tour using `steps` given in the configuration
driver.drive(); // Starts at step 0
driver.drive(4); // Starts at step 4

driver.moveNext(); // Move to the next step
driver.movePrevious(); // Move to the previous step
driver.moveTo(4); // Move to the step 4
driver.hasNextStep(); // Is there a next step
driver.hasPreviousStep(); // Is there a previous step

driver.isFirstStep(); // Is the current step the first step
driver.isLastStep(); // Is the current step the last step

driver.getActiveIndex(); // Gets the active step index

driver.getActiveStep(); // Gets the active step configuration
driver.getPreviousStep(); // Gets the previous step configuration
driver.getNextStep(); // Gets the next step configuration
driver.getActiveElement(); // Gets the active HTML element
driver.getPreviousElement(); // Gets the previous HTML element

// Is the tour or highlight currently active
driver.isActive();

// Recalculate and redraw the highlight
driver.refresh();

driver.getConfig();
driver.setConfig({
  /* ... */
});

driver.setSteps([
  /* ... */
]); // Set the steps

// The driver.js state shape (see Configuration > State)
driver.getState();

// The reactive, Vue-facing state (see Headless)
driver.state;

driver.highlight({
  /* ... */
}); // Highlight an element

driver.destroy(); // Destroy the tour
```

> Each `createDriver()` call returns its own independent instance. Create as many as you need; their configuration, steps and state never overlap.

## `useDriver()`

```ts
const {
  driver, // the instance above

  // reactive refs mirroring driver.state
  isActive,
  activeIndex,
  activeStep,
  activeElement,
  previousStep,
  previousElement,
  stage,
  popover,
  transitioning,
  isFirstStep,
  isLastStep,
  hasNextStep,
  hasPreviousStep,

  // bound methods
  drive,
  highlight,
  moveNext,
  movePrevious,
  moveTo,
  refresh,
  destroy,
  setSteps,
  setConfig,
} = useDriver(config, { shared: false });
```

`config` may be a plain object, a ref or a getter; a reactive config is re-applied with `setConfig` on change. With `shared: true` the plugin's app-wide driver is used instead of a new one (and not destroyed on unmount).

## Hints

See the [Hints example](../examples/hints#options) for the `Hints` methods.

## Generated reference

Every exported type and function is documented in the generated [Reference](./reference/), and the components in [Components](./components).
