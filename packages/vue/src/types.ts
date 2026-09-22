import type { Component } from "vue";

// Public types. The names and members of Config, DriveStep, Popover, Driver,
// State and the hook types match driver.js 1.8 so that a tour written for
// driver.js can be passed to driver-vue unchanged. Additions are marked.

export type Side = "top" | "right" | "bottom" | "left";
export type Alignment = "start" | "center" | "end";
export type AllowedButtons = "next" | "previous" | "close";

export type HookOpts = {
  config: Config;
  state: State;
  driver: Driver;
  index: number | undefined;
};

export type DriverHook = (element: Element | undefined, step: DriveStep, opts: HookOpts) => void;

/**
 * The DOM of a rendered popover, handed to `onPopoverRender`. With the default
 * `DriverPopover` every part is present; a custom popover component or a slot
 * that omits a part leaves the corresponding key `null`.
 */
export type PopoverDOM = {
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

export type Popover = {
  title?: string;
  description?: string;
  side?: Side;
  align?: Alignment;

  showButtons?: AllowedButtons[];
  showProgress?: boolean;
  disableButtons?: AllowedButtons[];

  popoverClass?: string;

  // Button texts
  progressText?: string;
  doneBtnText?: string;
  nextBtnText?: string;
  prevBtnText?: string;

  // Called after the popover is rendered
  onPopoverRender?: (popover: PopoverDOM, opts: HookOpts) => void;

  // Button callbacks
  onNextClick?: DriverHook;
  onPrevClick?: DriverHook;
  onCloseClick?: DriverHook;
  onDoneClick?: DriverHook;

  /**
   * driver-vue addition: a Vue component rendered as the popover body for this
   * step, in place of the default title/description/footer. It receives the
   * tour slot props (`TourSlotProps`) plus `props` below.
   */
  component?: Component;
  /** driver-vue addition: extra props passed to `component`. */
  props?: Record<string, unknown>;
};

export type DriveStep = {
  element?: string | Element | (() => Element);
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
  onDeselected?: DriverHook;
  popover?: Popover;
  disableActiveInteraction?: boolean;
  advanceOnClick?: boolean;
  skipMissingElement?: boolean;
  waitForElement?: number;
  data?: Record<string, any>;
};

/** driver-vue addition: global component overrides. */
export type DriverComponents = {
  /** Rendered as the popover body when a step has no `popover.component`. */
  popover?: Component;
  /** Replaces the default overlay (the dimmed page with the cutout). */
  overlay?: Component;
};

export type Config = {
  steps?: DriveStep[];

  animate?: boolean;
  duration?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  smoothScroll?: boolean;
  allowClose?: boolean;
  allowScroll?: boolean;
  overlayClickBehavior?: "close" | "nextStep" | DriverHook;
  stagePadding?: number;
  stageRadius?: number;

  disableActiveInteraction?: boolean;

  // Advance the tour when the highlighted element is clicked, through the same
  // hook resolution as the next button. The element's own click behaviour
  // still runs; nothing is prevented. (default: false)
  advanceOnClick?: boolean;

  // Skip a step whose target element is specified but missing from the DOM.
  // Element-less steps are intentional centered steps and never skipped. (default: false)
  skipMissingElement?: boolean;

  // Wait up to this many milliseconds for a step's missing element to appear
  // before falling back to the usual missing-element behaviour (centered
  // popover, or a skip when skipMissingElement is set). The current step
  // stays highlighted while waiting. (default: 0, off)
  waitForElement?: number;

  allowKeyboardControl?: boolean;

  // Popover specific configuration
  popoverClass?: string;
  popoverOffset?: number;
  showButtons?: AllowedButtons[];
  disableButtons?: AllowedButtons[];
  showProgress?: boolean;

  // Button texts
  progressText?: string;
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;

  // Called after the popover is rendered
  onPopoverRender?: (popover: PopoverDOM, opts: HookOpts) => void;

  // State based callbacks, called upon state changes
  onHighlightStarted?: DriverHook;
  onHighlighted?: DriverHook;
  onDeselected?: DriverHook;
  onDestroyStarted?: DriverHook;
  onDestroyed?: DriverHook;

  // Event based callbacks, called upon events
  onNextClick?: DriverHook;
  onPrevClick?: DriverHook;
  onCloseClick?: DriverHook;
  onDoneClick?: DriverHook;

  /**
   * driver-vue addition: easing of the stage animation between two elements.
   * Receives the normalized time (0..1) and returns the normalized progress.
   * (default: ease-in-out quad, as driver.js)
   */
  easing?: (t: number) => number;

  /** driver-vue addition: global component overrides, see `DriverComponents`. */
  components?: DriverComponents;

  /** driver-vue addition: where `<DriverTour>` teleports its UI. (default: "body") */
  teleportTo?: string | Element;

  /** driver-vue addition: base z-index of the overlay; the popover sits above it. (default: 10000) */
  zIndex?: number;

  /** driver-vue addition: class added to the `.driver-stage` box, for per-tour highlight effects. */
  stageClass?: string;

  /** driver-vue addition: class added to the overlay root. */
  overlayClass?: string;
};

/** The cutout rectangle, in viewport coordinates, without the stage padding. */
export type StageRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Everything a popover needs to render, fully resolved against the step and
 * the config. Consumed by `<DriverPopover>`, slots and custom components.
 */
export type PopoverRenderModel = {
  /** Increments per render so a fresh popover mounts on every step. */
  key: number;

  title?: string;
  description?: string;

  showButtons: AllowedButtons[];
  disableButtons: AllowedButtons[];
  showProgress: boolean;

  progressText: string;
  nextBtnText: string;
  prevBtnText: string;

  /** The next button acts as the tour's done button. */
  doneButton: boolean;

  popoverClass: string;

  side: Side;
  align: Alignment;
  /** Gap between the cutout and the popover (stagePadding + popoverOffset). */
  offset: number;
  /** The stage padding, used to expand the anchor rect to the cutout. */
  padding: number;
  /** No real element: center the popover in the viewport like a modal. */
  centered: boolean;

  smoothScroll: boolean;

  component?: Component;
  componentProps?: Record<string, unknown>;

  onNextClick: () => void;
  onPrevClick: () => void;
  onCloseClick: () => void;
};

/**
 * The reactive, Vue-facing state of a driver. Read it through `driver.state`
 * or the refs returned by `useDriver()`; the engine owns every write.
 */
export type DriverState = {
  isActive: boolean;

  activeIndex?: number;
  activeStep?: DriveStep;
  activeElement?: Element;
  previousStep?: DriveStep;
  previousElement?: Element;

  /** The stage animation between two elements is in flight. */
  transitioning: boolean;
  /** The current cutout rect (interpolated while transitioning). */
  stage?: StageRect;
  /** The popover to render, or undefined while it is hidden. */
  popover?: PopoverRenderModel;
  /** The rendered popover DOM, once the popover component reports it. */
  popoverDom?: PopoverDOM;
  /** Bumped by `refresh()` so components re-measure. */
  refreshTick: number;
};

/**
 * The state shape driver.js exposes through `getState()` and the hook
 * options. Kept for parity; prefer `DriverState` in Vue code.
 */
export type State = {
  isInitialized?: boolean;

  activeIndex?: number;
  activeElement?: Element;
  activeStep?: DriveStep;
  previousElement?: Element;
  previousStep?: DriveStep;

  popover?: PopoverDOM;

  // actual values considering the animation
  // and delays. These are used to determine
  // the positions etc.
  __previousElement?: Element;
  __activeElement?: Element;
  __previousStep?: DriveStep;
  __activeStep?: DriveStep;

  __activeOnDestroyed?: Element;
  __resizeTimeout?: number;
  __transitionCallback?: () => void;
  __pendingWaitCancel?: () => void;
  __activeStagePosition?: StageRect;

  __events?: {
    onKeyup: (e: KeyboardEvent) => void;
    onKeydown: (e: KeyboardEvent) => void;
    onResize: () => void;
    onScroll: () => void;
    onClick: (e: MouseEvent) => void;
  };
};

export interface GetConfig {
  (): Config;
  <K extends keyof Config>(key: K): Config[K];
}

export interface GetState {
  (): State;
  <K extends keyof State>(key: K): State[K];
}

export type SetState = <K extends keyof State>(key: K, value: State[K]) => void;

/** Methods the rendering components call back into; not part of the public API. */
export type DriverInternal = {
  /** The popover component mounted; runs `onPopoverRender` and stores the DOM. */
  reportPopoverDom: (dom: PopoverDOM) => void;
  /** The popover component unmounted. */
  clearPopoverDom: () => void;
  /** The dimmed part of the overlay was clicked. */
  overlayClick: () => void;
};

export interface Driver {
  isActive: () => boolean;
  refresh: () => void;
  drive: (stepIndex?: number) => void;
  setConfig: (config: Config) => void;
  setSteps: (steps: DriveStep[]) => void;
  getConfig: GetConfig;
  getState: GetState;
  getActiveIndex: () => number | undefined;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  getActiveStep: () => DriveStep | undefined;
  getActiveElement: () => Element | undefined;
  getPreviousElement: () => Element | undefined;
  getPreviousStep: () => DriveStep | undefined;
  getNextStep: () => DriveStep | undefined;
  moveNext: () => void;
  movePrevious: () => void;
  moveTo: (index: number) => void;
  hasNextStep: () => boolean;
  hasPreviousStep: () => boolean;
  highlight: (step: DriveStep) => void;
  destroy: () => void;

  /** driver-vue addition: the reactive state rendered by `<DriverTour>`. */
  readonly state: Readonly<DriverState>;
  /** @internal */
  readonly __internal: DriverInternal;
}
