# Configuration

The configuration is driver.js's, with a handful of Vue-specific additions marked below. Everything is typed; your editor shows the same documentation.

> Configuration, steps and state belong to the driver instance you set them on. Every `useDriver()` / `createDriver()` call is independent, so several tours can coexist on one page.

## Driver configuration

Passed to `useDriver(config)`, `createDriver(config)` or `driver.setConfig(config)`.

```ts
type Config = {
  // Array of steps to highlight. You should pass
  // this when you want to setup a product tour.
  steps?: DriveStep[];

  // Whether to animate the product tour. (default: true)
  animate?: boolean;
  // Duration of the transition animation in milliseconds. Controls both the
  // speed of the stage moving between steps and the overlay/popover fade-in.
  // Only applies when `animate` is true. (default: 400)
  duration?: number;
  // Overlay color. (default: black)
  overlayColor?: string;
  // Opacity of the backdrop. (default: 0.7)
  overlayOpacity?: number;
  // Whether to smooth scroll to the highlighted element. (default: false)
  smoothScroll?: boolean;
  // Whether to allow closing the popover by clicking on the backdrop. (default: true)
  allowClose?: boolean;
  // Whether to allow scrolling the page while the driver is active. (default: true)
  allowScroll?: boolean;
  // What to do when the overlay backdrop is clicked.
  // Possible options are 'close', 'nextStep', or a custom function. (default: 'close')
  overlayClickBehavior?: "close" | "nextStep" | DriverHook;
  // Distance between the highlighted element and the cutout. (default: 10)
  stagePadding?: number;
  // Radius of the cutout around the highlighted element. (default: 5)
  stageRadius?: number;

  // Whether to allow keyboard navigation. (default: true)
  allowKeyboardControl?: boolean;

  // Whether to disable interaction with the highlighted element. (default: false)
  // Can be configured at the step level as well
  disableActiveInteraction?: boolean;

  // Advance the tour when the highlighted element is clicked, as if the next
  // button was pressed; onNextClick and onDoneClick still apply. The element's
  // own click behavior runs normally. Can be configured per step. (default: false)
  advanceOnClick?: boolean;

  // Skip a step whose target element is specified but missing from the DOM.
  // Element-less steps are intentional centered steps and never skipped.
  // Can be configured per step. (default: false)
  skipMissingElement?: boolean;

  // Wait up to this many milliseconds for a step's element to appear before
  // treating it as missing. The current step stays highlighted while waiting.
  // Can be configured per step. (default: 0, off)
  waitForElement?: number;

  // If you want to add custom class to the popover
  popoverClass?: string;
  // Distance between the popover and the highlighted element. (default: 10)
  popoverOffset?: number;
  // Array of buttons to show in the popover. Defaults to ["next", "previous", "close"]
  // for product tours and [] for single element highlighting.
  showButtons?: AllowedButtons[];
  // Array of buttons to disable.
  disableButtons?: AllowedButtons[];

  // Whether to show the progress text in popover. (default: false)
  showProgress?: boolean;
  // Template for the progress text: {{current}} and {{total}}.
  progressText?: string;

  // Text to show in the buttons. `doneBtnText` is used on the last step of a tour.
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;

  // Called after the popover is rendered, with references to its DOM parts.
  onPopoverRender?: (popover: PopoverDOM, options: HookOpts) => void;

  // Hooks to run before and after highlighting each step.
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
  onDeselected?: DriverHook;

  // Hooks to run before and after the driver is destroyed.
  onDestroyStarted?: DriverHook;
  onDestroyed?: DriverHook;

  // Hooks to run on button clicks.
  onNextClick?: DriverHook;
  onPrevClick?: DriverHook;
  onCloseClick?: DriverHook;
  // Runs instead of `onNextClick` on the last step.
  onDoneClick?: DriverHook;

  // ---- driver-vue additions ----

  // Easing of the stage animation between two elements. Receives the
  // normalized time (0..1) and returns the normalized progress.
  // (default: ease-in-out quad, as driver.js)
  easing?: (t: number) => number;

  // Global component overrides: a popover body used by every step that has no
  // `popover.component`, and a replacement for the overlay.
  components?: { popover?: Component; overlay?: Component };

  // Where <DriverTour> teleports its UI. (default: "body")
  teleportTo?: string | Element;

  // Base z-index of the overlay; the stage and the popover sit above it.
  // (default: 10000)
  zIndex?: number;
};

type DriverHook = (element: Element | undefined, step: DriveStep, options: HookOpts) => void;

type HookOpts = {
  config: Config;
  state: State;
  driver: Driver;
  // Zero-based index of the active step, undefined for a bare highlight().
  index: number | undefined;
};
```

> By overriding `onNextClick` and `onPrevClick` you control navigation: the buttons no longer move by themselves and you call `driver.moveNext()` / `driver.movePrevious()` when ready. Both can be set at the driver or the step level. `onDoneClick` runs instead of `onNextClick` on the last step and does not tear the tour down for you; call `driver.destroy()`.

> `options.index` is the index of the _active_ step. Inside `onDeselected` (fired for the step being left during a transition) it already points at the step being moved to.

## Popover configuration

```ts
type Popover = {
  // Title and description. Both are rendered as HTML (like driver.js), so
  // only pass trusted content; use slots or a component for anything else.
  title?: string;
  description?: string;

  // Which side of the element the popover is placed on. It flips to the
  // opposite side when it does not fit. (default: "bottom")
  side?: "top" | "right" | "bottom" | "left";
  // Alignment along that side. (default: "start")
  align?: "start" | "center" | "end";

  // Buttons to show; a single highlight shows none by default.
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

  // A Vue component rendered as the popover body for this step, in place of
  // the default title/description/footer. It receives the tour slot props
  // (TourSlotProps) plus `props`. See Custom Components.
  component?: Component;
  // Extra props passed to `component`.
  props?: Record<string, unknown>;
};
```

## Drive step configuration

```ts
type DriveStep = {
  // The target element: a DOM element, a function returning one, or a CSS
  // selector (first match). Omit it for a centered, modal-like step.
  element?: Element | string | (() => Element);

  popover?: Popover;

  disableActiveInteraction?: boolean;
  advanceOnClick?: boolean;
  skipMissingElement?: boolean;
  waitForElement?: number;

  // Arbitrary data to support custom logic in hooks.
  data?: Record<string, any>;

  onDeselected?: DriverHook;
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
};
```

## State

Two views of the state exist.

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

`driver.state` (and the refs from `useDriver`) is the reactive, Vue-facing shape that `<DriverTour>` renders from:

```ts
type DriverState = {
  isActive: boolean;
  activeIndex?: number;
  activeStep?: DriveStep;
  activeElement?: Element;
  previousStep?: DriveStep;
  previousElement?: Element;
  // The stage animation between two elements is in flight.
  transitioning: boolean;
  // The cutout rect (interpolated while transitioning), without padding.
  stage?: { x: number; y: number; width: number; height: number };
  // What the popover should render, or undefined while hidden.
  popover?: PopoverRenderModel;
  // The rendered popover's DOM parts.
  popoverDom?: PopoverDOM;
  // Bumped by refresh() so components re-measure.
  refreshTick: number;
};
```

`PopoverRenderModel` is the fully resolved popover (title, description, buttons, texts, `doneButton`, `side`, `align`, `centered`, `component`, and the `onNextClick` / `onPrevClick` / `onCloseClick` callbacks). Custom popovers and headless setups read it; see [Headless](../styling/headless).

## PopoverDOM

`onPopoverRender` receives the popover's DOM parts once the popover is in the page. With the default popover every part is present. With a custom body (slot or component) only `wrapper` is guaranteed; parts you do not render are `null`, and parts you do render with the driver.js class names (`driver-popover-title`, `driver-popover-footer`, ...) are picked up.

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
  // Merged under every useDriver() config and used by the shared driver.
  defaults: { animate: true, showProgress: true },
  // Register DriverTour, DriverPopover, DriverOverlay and DriverStage globally.
  // A string changes the prefix ("Tour" registers TourTour, TourPopover, ...).
  components: true,
});
```

## Hints configuration

Hints come from `useHints(config)` / `createHints(config)` in `driver-vue/hints`. The options are driver.js's:

```ts
type HintsConfig = {
  hints?: DriverHint[];
  // Beacon defaults applied to every hint; a hint's own beacon values win.
  beacon?: HintBeacon;
  // Text of the dismiss button. (default: "Got it")
  buttonText?: string;
  popoverClass?: string;
  popoverOffset?: number;
  // Dim the page while a hint is open, with the element cut out like a tour
  // step. (default: false)
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  onOpen?: HintHook;
  onDismiss?: HintHook;
  // Runs instead of dismissing when the button is clicked.
  onButtonClick?: HintHook;
};

type DriverHint = {
  element: Element | string | (() => Element);
  // Stable identity for open/dismiss/restore. Defaults to the index.
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
  animate?: boolean;
  className?: string;
};

type HintPopover = {
  title?: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  popoverClass?: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: HintHook;
  onPopoverRender?: (popover: PopoverDOM, options: { hint: DriverHint; hints: Hints }) => void;
};

type HintHook = (element: Element, hint: DriverHint, options: { config: HintsConfig; hints: Hints }) => void;
```

See the [Hints example](../examples/hints) and [Styling Hints](../styling/styling-hints).
