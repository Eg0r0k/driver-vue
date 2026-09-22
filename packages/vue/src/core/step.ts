import type { Context } from "./context";
import type { AllowedButtons, DriverHook, DriveStep, PopoverRenderModel } from "../types";
import { isDummyElement, resolveElement } from "./utils";

// Bridges the tour and the popover: a step's popover resolves here against
// the instance config (step value first, then the global default, then the
// built-in fallback) into a PopoverRenderModel that the components render.

const DEFAULT_PROGRESS_TEXT = "{{current}} of {{total}}";

let popoverKey = 0;

export const shouldSkipStep = (ctx: Context, step: DriveStep): boolean => {
  const skip = step.skipMissingElement ?? ctx.getConfig("skipMissingElement");
  if (!skip || !step.element) {
    return false;
  }

  return !resolveElement(step.element);
};

// The index navigation would actually land on, starting at fromIndex
// (inclusive) and walking in the given direction past any skipped steps.
// Resolved against the live DOM, so the answer can change as elements mount
// and unmount; every first/last-step decision goes through here so the done
// button and the tour's real end always agree.
export const findReachableIndex = (ctx: Context, fromIndex: number, direction: 1 | -1): number | undefined => {
  const steps = ctx.getConfig("steps") || [];

  for (let i = fromIndex; i >= 0 && i < steps.length; i += direction) {
    if (!shouldSkipStep(ctx, steps[i])) {
      return i;
    }
  }

  return undefined;
};

// On the final step the next button acts as the done button, so a dedicated
// onDoneClick takes precedence over onNextClick when provided.
export const resolveNextHook = (ctx: Context, step?: DriveStep): DriverHook | undefined => {
  const activeIndex = ctx.getState("activeIndex");
  const isLastStep = activeIndex !== undefined && findReachableIndex(ctx, activeIndex + 1, 1) === undefined;

  const onDoneClick = step?.popover?.onDoneClick || ctx.getConfig("onDoneClick");
  if (isLastStep && onDoneClick) {
    return onDoneClick;
  }

  return step?.popover?.onNextClick || ctx.getConfig("onNextClick");
};

export const resolvePrevHook = (ctx: Context, step?: DriveStep): DriverHook | undefined =>
  step?.popover?.onPrevClick || ctx.getConfig("onPrevClick");

export const resolveCloseHook = (ctx: Context, step?: DriveStep): DriverHook | undefined =>
  step?.popover?.onCloseClick || ctx.getConfig("onCloseClick");

// Default button actions passed in by the tour, which alone knows how to
// navigate and destroy; a hook from the step or the config wins over them.
export type TourStepDefaults = {
  onNextClick: DriverHook;
  onPrevClick: DriverHook;
  onCloseClick: DriverHook;
};

// The resolved step is what ends up in state and what the lifecycle hooks
// receive, not just what gets rendered.
export const resolveTourStep = (ctx: Context, stepIndex: number, defaults: TourStepDefaults): DriveStep => {
  const steps = ctx.getConfig("steps") || [];
  const step = steps[stepIndex];
  const popover = step.popover || {};

  const hasNextStep = findReachableIndex(ctx, stepIndex + 1, 1) !== undefined;
  const hasPreviousStep = findReachableIndex(ctx, stepIndex - 1, -1) !== undefined;

  const doneBtnText = popover.doneBtnText || ctx.getConfig("doneBtnText") || "Done";
  const allowsClosing = ctx.getConfig("allowClose");
  const showProgress =
    typeof popover.showProgress !== "undefined" ? popover.showProgress : ctx.getConfig("showProgress");
  const progressText = popover.progressText || ctx.getConfig("progressText") || DEFAULT_PROGRESS_TEXT;
  const progressTextReplaced = progressText
    .replace("{{current}}", `${stepIndex + 1}`)
    .replace("{{total}}", `${steps.length}`);

  // Unset means every button; an empty list means none (driver.js treated
  // `[]` on a tour step as "all", which made hiding the buttons impossible).
  const configuredButtons = popover.showButtons ?? ctx.getConfig("showButtons");
  const calculatedButtons: AllowedButtons[] = [
    "next",
    "previous",
    ...(allowsClosing ? ["close" as AllowedButtons] : []),
  ].filter(b => {
    return !configuredButtons || configuredButtons.includes(b as AllowedButtons);
  }) as AllowedButtons[];

  const onNextClick = popover.onNextClick || ctx.getConfig("onNextClick");
  const onPrevClick = popover.onPrevClick || ctx.getConfig("onPrevClick");
  const onCloseClick = popover.onCloseClick || ctx.getConfig("onCloseClick");

  return {
    ...step,
    popover: {
      showButtons: calculatedButtons,
      nextBtnText: !hasNextStep ? doneBtnText : undefined,
      disableButtons: [...(!hasPreviousStep ? ["previous" as AllowedButtons] : [])],
      showProgress,
      onNextClick: onNextClick ? onNextClick : defaults.onNextClick,
      onPrevClick: onPrevClick ? onPrevClick : defaults.onPrevClick,
      onCloseClick: onCloseClick ? onCloseClick : defaults.onCloseClick,
      ...popover,
      progressText: progressTextReplaced,
    },
  };
};

export const resolveStepPopover = (ctx: Context, element: Element, step: DriveStep): PopoverRenderModel => {
  const popover = step.popover || {};
  const stagePadding = ctx.getConfig("stagePadding") || 0;

  const activeIndex = ctx.getState("activeIndex");
  const isDoneStep = activeIndex !== undefined && findReachableIndex(ctx, activeIndex + 1, 1) === undefined;

  return {
    key: ++popoverKey,

    title: popover.title,
    description: popover.description,

    showButtons: popover.showButtons ?? ctx.getConfig("showButtons")!,
    disableButtons: popover.disableButtons || ctx.getConfig("disableButtons")! || [],
    showProgress: popover.showProgress || ctx.getConfig("showProgress") || false,

    progressText: popover.progressText ?? (ctx.getConfig("progressText") || DEFAULT_PROGRESS_TEXT),
    nextBtnText: popover.nextBtnText ?? (ctx.getConfig("nextBtnText") || "Next"),
    prevBtnText: popover.prevBtnText ?? (ctx.getConfig("prevBtnText") || "Previous"),

    doneButton: isDoneStep,

    popoverClass: popover.popoverClass || ctx.getConfig("popoverClass") || "",
    showArrow: popover.showArrow ?? ctx.getConfig("showArrow") ?? true,

    side: popover.side || "bottom",
    align: popover.align || "start",
    // The anchor rect is expanded by the stage padding (so the popover clears
    // the cutout) and the configured gap is kept between the two.
    offset: ctx.getConfig("popoverOffset") || 0,
    padding: stagePadding,
    // Without a real element the tour highlights a dummy element at the center
    // of the screen, and the popover is centered over it like a modal.
    centered: isDummyElement(element),

    smoothScroll: !!ctx.getConfig("smoothScroll"),

    component: popover.component ?? ctx.getConfig("components")?.popover,
    componentProps: popover.props,

    // The hooks are resolved when the button is clicked rather than up front,
    // so a setConfig() between render and click is still picked up.
    onNextClick: () => {
      const onNextClick = resolveNextHook(ctx, step);
      if (onNextClick) {
        return onNextClick(element, step, ctx.getHookOpts());
      }

      return ctx.emit("nextClick");
    },

    onPrevClick: () => {
      const onPrevClick = resolvePrevHook(ctx, step);
      if (onPrevClick) {
        return onPrevClick(element, step, ctx.getHookOpts());
      }

      return ctx.emit("prevClick");
    },

    onCloseClick: () => {
      const onCloseClick = resolveCloseHook(ctx, step);
      if (onCloseClick) {
        return onCloseClick(element, step, ctx.getHookOpts());
      }

      return ctx.emit("closeClick");
    },
  };
};

/** Show the step's popover (the component mounts from the reactive state). */
export const renderStepPopover = (ctx: Context, element: Element, step: DriveStep) => {
  ctx.state.popover = resolveStepPopover(ctx, element, step);
};

/** Hide the popover; the component unmounts from the reactive state. */
export const hideStepPopover = (ctx: Context) => {
  ctx.state.popover = undefined;
};
