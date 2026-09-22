import type { Context } from "./context";
import type { AllowedButtons, DriverHook, DriveStep, PopoverRenderModel } from "../types";
import { isDummyElement, resolveElement } from "./utils";

const DEFAULT_PROGRESS_TEXT = "{{current}} of {{total}}";

let popoverKey = 0;

export const shouldSkipStep = (ctx: Context, step: DriveStep): boolean => {
  const skip = step.skipMissingElement ?? ctx.getConfig("skipMissingElement");
  if (!skip || !step.element) {
    return false;
  }

  return !resolveElement(step.element);
};

export const findReachableIndex = (ctx: Context, fromIndex: number, direction: 1 | -1): number | undefined => {
  const steps = ctx.getConfig("steps") || [];

  for (let i = fromIndex; i >= 0 && i < steps.length; i += direction) {
    if (!shouldSkipStep(ctx, steps[i])) {
      return i;
    }
  }

  return undefined;
};

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

export type TourStepDefaults = {
  onNextClick: DriverHook;
  onPrevClick: DriverHook;
  onCloseClick: DriverHook;
};

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
    offset: ctx.getConfig("popoverOffset") || 0,
    padding: stagePadding,
    centered: isDummyElement(element),

    smoothScroll: !!ctx.getConfig("smoothScroll"),

    component: popover.component ?? ctx.getConfig("components")?.popover,
    componentProps: popover.props,

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
