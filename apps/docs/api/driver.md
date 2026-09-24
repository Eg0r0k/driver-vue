# Driver methods

The methods of a driver instance, as returned by `createDriver()` (or its driver.js alias `driver()`) and as `driver` from `useDriver()`. They are the driver.js methods plus `state`. The options are listed in [Configuration](../guide/configuration).

```ts
import { createDriver } from "driver-vue";

const driver = createDriver({
  /* config */
});

// Start the tour with the configured steps
driver.drive(); // at step 0
driver.drive(4); // at step 4

// Navigation
driver.moveNext(); // go to the next step; on the last step, end the tour
driver.movePrevious(); // go to the previous step; on the first step, end the tour
driver.moveTo(4); // go to step 4; an index without a step ends the tour

// Position in the tour
driver.hasNextStep();
driver.hasPreviousStep();
driver.isFirstStep();
driver.isLastStep();
driver.getActiveIndex(); // undefined when no step is active

// Steps and elements
driver.getActiveStep(); // the active step, resolved with the config defaults
driver.getPreviousStep();
driver.getNextStep(); // the next step as configured
driver.getActiveElement();
driver.getPreviousElement();

// Highlight one element without a tour
driver.highlight({
  element: "#some-element",
  popover: { title: "Title", description: "Description" },
});

// Is a tour or highlight running
driver.isActive();

// Measure and draw the highlight again, after a layout change
driver.refresh();

// Config
driver.getConfig(); // the whole config
driver.getConfig("steps"); // one option
driver.setConfig({
  /* config */
});
driver.setSteps([
  /* steps */
]);

// State
driver.getState(); // the driver.js state object
driver.getState("activeIndex"); // one key
driver.state; // the reactive state, see Headless

// End the tour
driver.destroy();
```

Details that differ from what the names suggest:

- `drive()` and `highlight()` do nothing on the server.
- `hasNextStep()`, `hasPreviousStep()`, `isFirstStep()`, `isLastStep()` and `getNextStep()` skip the steps that `skipMissingElement` would skip.
- `highlight()` hides the buttons and the progress text unless the step's `popover` sets `showButtons` or `showProgress`.
- For a step without an element, `getActiveElement()` returns a placeholder element, as in driver.js. The `activeElement` ref of `useDriver()` is `undefined` in that case.
- `setConfig()` replaces the config. Options you leave out go back to their defaults; they are not kept from the previous config. To change one option, spread the current config: `driver.setConfig({ ...driver.getConfig(), overlayOpacity: 0.5 })`.
- `setSteps()` replaces the steps, keeps the other options and resets the tour state.
- `destroy()` does not call `onDestroyStarted`. The close button, Escape and overlay clicks do, so a hook that asks for confirmation calls `destroy()` itself to end the tour.
- `driver.state` is a `shallowReactive` object, `getState()` a plain one kept for driver.js compatibility. The reactive state is described in [Headless](../styling/headless#the-state).

Each `createDriver()` call returns an independent instance. Several can exist at once; their config, steps and state are separate.

## `useDriver()`

```ts
const {
  driver, // the instance above

  // computed refs over driver.state
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

  // the driver's methods
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

`config` is a plain object, a ref or a getter. The plugin's `defaults` are merged under it, and a ref or getter is applied again with `setConfig` when it changes. With `shared: true` the plugin's app-wide driver is used instead of a new one, and it is not destroyed when the component unmounts. [Basic usage](../guide/basic-usage) explains how to use it.

## Hints

The methods of a hints instance are listed in the [Hints example](../examples/hints#instance-methods).

## Generated reference

Every exported type and function is in the generated [Reference](./reference/), and the components are in [Components](./components).
