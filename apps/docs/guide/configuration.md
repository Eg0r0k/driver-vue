# Configuration

The configuration is the driver.js configuration, plus the driver-vue additions marked below. The same comments appear in your editor through the types.

Config, steps and state belong to the driver you set them on. Each `useDriver()` or `createDriver()` call creates an independent driver, so several tours can exist on one page.

## Driver configuration

Passed to `useDriver(config)`, `createDriver(config)` or `driver.setConfig(config)`.

```ts
type Config = {
  // The steps of a tour. Not needed for highlight().
  steps?: DriveStep[];

  // Animate the stage between steps and fade in the overlay and popover. (default: true)
  animate?: boolean;
  // Duration of those animations in milliseconds. Used only when `animate`
  // is true. (default: 400)
  duration?: number;
  // Color of the overlay. (default: "#000")
  overlayColor?: string;
  // Opacity of the overlay. (default: 0.7)
  overlayOpacity?: number;
  // Scroll the element into view with a smooth scroll instead of a jump. (default: false)
  smoothScroll?: boolean;
  // Allow closing the tour with the close button, Escape or a click on the
  // overlay. When false, a tour does not show the close button. (default: true)
  allowClose?: boolean;
  // Allow scrolling the page while the tour is active. (default: true)
  allowScroll?: boolean;
  // What a click on the overlay does: "close" (only when `allowClose` is on),
  // "nextStep", or a function that runs instead. (default: "close")
  overlayClickBehavior?: "close" | "nextStep" | DriverHook;
  // Space between the element and the edge of the cutout, in px. (default: 10)
  stagePadding?: number;
  // Corner radius of the cutout, in px. (default: 5)
  stageRadius?: number;

  // Move between steps with the arrow keys and close with Escape. (default: true)
  allowKeyboardControl?: boolean;

  // Block clicks on the highlighted element. Can be set per step. (default: false)
  disableActiveInteraction?: boolean;

  // A click on the highlighted element moves to the next step, like the next
  // button. The element's own click handlers still run. Can be set per step.
  // (default: false)
  advanceOnClick?: boolean;

  // Skip a step whose `element` is set but not found in the DOM. Steps without
  // an element are never skipped. Can be set per step. (default: false)
  skipMissingElement?: boolean;

  // Wait up to this many milliseconds for a step's element to appear before
  // treating it as missing. The current step stays highlighted while waiting.
  // Can be set per step. (default: 0, no waiting)
  waitForElement?: number;

  // Class added to the popover.
  popoverClass?: string;
  // Gap between the cutout and the popover, in px. (default: 10)
  popoverOffset?: number;
  // Buttons shown in the popover. (default: ["next", "previous", "close"] in a
  // tour, [] for highlight())
  showButtons?: AllowedButtons[];
  // Buttons shown but disabled. (default: [])
  disableButtons?: AllowedButtons[];

  // Show the progress text in the popover. (default: false)
  showProgress?: boolean;
  // Progress text; {{current}} and {{total}} are replaced. (default: "{{current}} of {{total}}")
  progressText?: string;

  // Button texts. `doneBtnText` replaces the next button text on the last step.
  // (defaults: "Next", "Previous", "Done")
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;

  // Runs after the popover is rendered, with its DOM parts.
  onPopoverRender?: (popover: PopoverDOM, options: HookOpts) => void;

  // Run before a step is highlighted, after it is highlighted, and when the
  // tour leaves it.
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
  onDeselected?: DriverHook;

  // Runs when the tour is about to close. When set, the tour stays open until
  // you call driver.destroy().
  onDestroyStarted?: DriverHook;
  // Runs after the tour has closed.
  onDestroyed?: DriverHook;

  // Run on button clicks, in place of the default action.
  onNextClick?: DriverHook;
  onPrevClick?: DriverHook;
  onCloseClick?: DriverHook;
  // Runs instead of `onNextClick` on the last step.
  onDoneClick?: DriverHook;

  // ---- driver-vue additions ----

  // Show the arrow that points from the popover to the element. (default: true)
  showArrow?: boolean;

  // Easing of the stage animation between two elements. Receives the
  // normalized time (0..1) and returns the normalized progress.
  // (default: ease-in-out quad, as in driver.js)
  easing?: (t: number) => number;

  // Class added to the `.driver-stage` box, for per-tour highlight effects.
  stageClass?: string;
  // Class added to the overlay root.
  overlayClass?: string;

  // Components used for every step: `popover` replaces the popover body of
  // steps without `popover.component`, `overlay` replaces the overlay.
  components?: { popover?: Component; overlay?: Component };

  // Where <DriverTour> teleports its elements. (default: "body")
  teleportTo?: string | Element;

  // z-index of the overlay. The stage is at zIndex + 1 and the popover at
  // zIndex + 2. (default: 10000)
  zIndex?: number;

  // What happens when the highlighted element is scrolled out of the viewport.
  // "stick" keeps the popover pinned to the nearest edge with the arrow
  // pointing back at the element; "close" ends the tour (only when
  // `allowClose` is on); a function runs instead, once per departure.
  // (default: "stick")
  scrollAwayBehavior?: "stick" | "close" | DriverHook;
  // How far (px) the element has to be past the viewport edge before
  // `scrollAwayBehavior` runs. (default: 0)
  scrollAwayOffset?: number;
  // While the element is out of view, a click on the popover scrolls it back
  // into view. (default: false)
  scrollBackOnClick?: boolean;
};

type DriverHook = (element: Element | undefined, step: DriveStep, options: HookOpts) => void;

type HookOpts = {
  config: Config;
  state: State;
  driver: Driver;
  // Index of the active step, undefined for highlight(). Inside onDeselected
  // it already points at the step being moved to.
  index: number | undefined;
};
```

How the button hooks replace the default navigation is described in [Popover buttons](../examples/buttons), `onDestroyStarted` in [Exiting a tour](../examples/exiting), and the scroll-away options in [Element out of view](../examples/scroll-away).

## Popover configuration

Set per step as `step.popover`. Most options override the driver option of the same name.

```ts
type Popover = {
  // Title and description. Both are rendered as HTML (as in driver.js), so
  // pass only trusted content; use slots or a component for anything else.
  title?: string;
  description?: string;

  // Preferred side of the element. When that side has no room, the opposite
  // side is tried, then the perpendicular ones. (default: "bottom")
  side?: "top" | "right" | "bottom" | "left";
  // Alignment along that side. (default: "start")
  align?: "start" | "center" | "end";

  showButtons?: ("next" | "previous" | "close")[];
  disableButtons?: ("next" | "previous" | "close")[];

  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;

  showProgress?: boolean;
  progressText?: string;

  popoverClass?: string;

  onPopoverRender?: (popover: PopoverDOM, options: HookOpts) => void;

  onNextClick?: DriverHook;
  onPrevClick?: DriverHook;
  onCloseClick?: DriverHook;
  onDoneClick?: DriverHook;

  // ---- driver-vue additions ----

  // Show the arrow for this step. (default: the driver's `showArrow`)
  showArrow?: boolean;

  // A Vue component rendered as the popover body for this step, in place of
  // the default title, description and footer. It receives the tour slot
  // props (TourSlotProps) plus `props`.
  component?: Component;
  // Extra props passed to `component`.
  props?: Record<string, unknown>;
};
```

Placement is described in [Popover position](../examples/popover-position), `component` in [Custom components](../styling/custom-components).

## Drive step configuration

```ts
type DriveStep = {
  // The target: a DOM element, a function returning one, or a CSS selector
  // (first match). Without it the popover is centered on the screen.
  element?: Element | string | (() => Element);

  popover?: Popover;

  // Per-step versions of the driver options.
  disableActiveInteraction?: boolean;
  advanceOnClick?: boolean;
  skipMissingElement?: boolean;
  waitForElement?: number;

  // Any data you want to read in hooks.
  data?: Record<string, any>;

  // Per-step hooks; they replace the driver's hooks for this step.
  onDeselected?: DriverHook;
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
};
```

## State

There are two views of the state.

`driver.getState()` and `options.state` in hooks return the driver.js shape:

```ts
type State = {
  isInitialized?: boolean;
  activeIndex?: number;
  activeElement?: Element;
  activeStep?: DriveStep;
  previousElement?: Element;
  previousStep?: DriveStep;
  // The rendered popover's DOM parts.
  popover?: PopoverDOM;
};
```

`driver.state` (and the refs from `useDriver`) is the reactive shape that `<DriverTour>` renders from:

```ts
type DriverState = {
  isActive: boolean;
  activeIndex?: number;
  activeStep?: DriveStep;
  activeElement?: Element;
  previousStep?: DriveStep;
  previousElement?: Element;
  // The stage animation between two elements is running.
  transitioning: boolean;
  // The cutout rect without padding, interpolated while transitioning.
  stage?: { x: number; y: number; width: number; height: number };
  // What the popover renders, or undefined while it is hidden.
  popover?: PopoverRenderModel;
  // The rendered popover's DOM parts.
  popoverDom?: PopoverDOM;
  // Incremented by refresh() so components measure again.
  refreshTick: number;
};
```

`PopoverRenderModel` is the popover resolved against the step and the driver config: texts, buttons, `side`, `align`, `centered`, `component`, and the `onNextClick` / `onPrevClick` / `onCloseClick` callbacks. The full type is in the [API reference](../api/reference/index/type-aliases/PopoverRenderModel). [Headless](../styling/headless) shows how to render from it.

## PopoverDOM

`onPopoverRender` receives the popover's DOM parts once the popover is in the page. With the default popover every part is present. With a custom body (slot or component) only `wrapper` is guaranteed: parts you do not render are `null`, and parts you render with the driver.js class names (`driver-popover-title`, `driver-popover-footer`, ...) are picked up.

```ts
type PopoverDOM = {
  wrapper: HTMLElement;
  arrow: HTMLElement | null;
  title: HTMLElement | null;
  description: HTMLElement | null;
  footer: HTMLElement | null;
  progress: HTMLElement | null;
  previousButton: HTMLButtonElement | null;
  nextButton: HTMLButtonElement | null;
  closeButton: HTMLButtonElement | null;
  footerButtons: HTMLElement | null;
};
```

## Plugin options

```ts
app.use(DriverPlugin, {
  // Merged under every useDriver() config and used by the app-wide driver.
  defaults: { animate: true, showProgress: true },
  // Register DriverTour, DriverPopover, DriverOverlay, DriverBoxOverlay and
  // DriverStage globally. A string changes the "Driver" prefix ("Tour"
  // registers TourTour, TourPopover, ...). (default: false)
  components: true,
});
```

## Hints configuration

Hints come from `useHints(config)` or `createHints(config)` in `driver-vue/hints`. The options are driver.js's, plus the driver-vue additions marked below.

```ts
type HintsConfig = {
  hints?: DriverHint[];
  // Beacon defaults for every hint; a hint's own beacon values win.
  beacon?: HintBeacon;
  // Text of the dismiss button. (default: "Got it")
  buttonText?: string;
  popoverClass?: string;
  // Gap between the beacon (or the element, with `overlay`) and the popover. (default: 10)
  popoverOffset?: number;
  // Dim the page while a hint is open, with the element cut out as in a tour.
  // (default: false)
  overlay?: boolean;
  // (default: "#000")
  overlayColor?: string;
  // (default: 0.7)
  overlayOpacity?: number;
  onOpen?: HintHook;
  onDismiss?: HintHook;
  // Runs instead of dismissing when the button is clicked.
  onButtonClick?: HintHook;

  // ---- driver-vue additions ----

  // Show the popover arrow. (default: true)
  showArrow?: boolean;
  // Where <DriverHints> teleports its elements. (default: "body")
  teleportTo?: string | Element;
  // Base z-index. (default: 10000)
  zIndex?: number;
};

type DriverHint = {
  element: Element | string | (() => Element);
  // Identity used by open, dismiss and restore. (default: the index)
  id?: string;
  beacon?: HintBeacon;
  popover?: HintPopover;
  onOpen?: HintHook;
  onDismiss?: HintHook;
  data?: Record<string, any>;
};

type HintBeacon = {
  side?: "top" | "right" | "bottom" | "left"; // default "top"
  align?: "start" | "center" | "end"; // default "end"
  offsetX?: number;
  offsetY?: number;
  // Pulse animation. (default: true)
  animate?: boolean;
  className?: string;
};

type HintPopover = {
  title?: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left"; // default "bottom"
  align?: "start" | "center" | "end"; // default "start"
  popoverClass?: string;
  // Show the dismiss button. (default: true)
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: HintHook;
  onPopoverRender?: (popover: PopoverDOM, options: { hint: DriverHint; hints: Hints }) => void;

  // ---- driver-vue additions ----

  showArrow?: boolean;
  // A Vue component rendered as the popover body, and its extra props.
  component?: Component;
  props?: Record<string, unknown>;
};

type HintHook = (element: Element, hint: DriverHint, options: { config: HintsConfig; hints: Hints }) => void;
```

Usage is in [Hints](../examples/hints), the CSS in [Styling hints](../styling/styling-hints).
