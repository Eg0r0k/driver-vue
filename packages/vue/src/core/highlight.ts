import type { Context } from "./context";
import type { DriveStep, StageRect } from "../types";
import { hideStepPopover, renderStepPopover } from "./step";
import { DUMMY_ELEMENT_ID, easeInOutQuad, isDummyElement, isScrollable, resolveElement, bringInView } from "./utils";

const mountDummyElement = (): Element => {
  const existingDummy = document.getElementById(DUMMY_ELEMENT_ID);
  if (existingDummy) {
    return existingDummy;
  }

  const element = document.createElement("div");

  element.id = DUMMY_ELEMENT_ID;
  element.style.width = "0";
  element.style.height = "0";
  element.style.pointerEvents = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.top = "50%";
  element.style.left = "50%";

  document.body.appendChild(element);

  return element;
};

const rectOf = (element: Element): StageRect => {
  const rect = element.getBoundingClientRect();

  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};

export const highlight = (ctx: Context, step: DriveStep) => {
  let elemObj = resolveElement(step.element);

  // If the element is not found, we mount a 1px div
  // at the center of the screen to highlight and show
  // the popover on top of that. This is to show a
  // modal-like highlight.
  if (!elemObj) {
    elemObj = mountDummyElement();
  }

  transferHighlight(ctx, elemObj, step);
};

// The stage snaps to the element's current box and the components re-measure.
export const trackActiveElement = (ctx: Context, element: Element) => {
  if (!element) {
    return;
  }

  const activeStagePosition = rectOf(element);

  ctx.setState("__activeStagePosition", activeStagePosition);
  ctx.state.stage = activeStagePosition;
};

export const refreshActiveHighlight = (ctx: Context) => {
  const activeHighlight = ctx.getState("__activeElement");

  if (!activeHighlight) {
    return;
  }

  trackActiveElement(ctx, activeHighlight);
  ctx.state.refreshTick++;
};

// One frame of the stage animation: the cutout eases from where it was when
// the transfer started to the target element's box.
const transitionStage = (ctx: Context, elapsed: number, duration: number, from: StageRect, to: Element) => {
  const easing = ctx.getConfig("easing") || easeInOutQuad;
  const progress = easing(Math.min(Math.max(elapsed / duration, 0), 1));
  const toDefinition = rectOf(to);

  const lerp = (a: number, b: number) => a + (b - a) * progress;

  const activeStagePosition: StageRect = {
    x: lerp(from.x, toDefinition.x),
    y: lerp(from.y, toDefinition.y),
    width: lerp(from.width, toDefinition.width),
    height: lerp(from.height, toDefinition.height),
  };

  ctx.setState("__activeStagePosition", activeStagePosition);
  ctx.state.stage = activeStagePosition;
};

const transferHighlight = (ctx: Context, toElement: Element, toStep: DriveStep) => {
  const duration = ctx.getConfig("duration") || 400;
  const start = Date.now();

  const fromStep = ctx.getState("__activeStep");
  const fromElement = ctx.getState("__activeElement") || toElement;

  // If it's the first time we're highlighting an element, we show
  // the popover immediately. Otherwise, we wait for the animation
  // to finish before showing the popover.
  const isFirstHighlight = !fromElement || fromElement === toElement;
  const isToDummyElement = isDummyElement(toElement);
  const isFromDummyElement = isDummyElement(fromElement);

  const isAnimatedTour = ctx.getConfig("animate");
  const highlightStartedHook = toStep.onHighlightStarted || ctx.getConfig("onHighlightStarted");
  const highlightedHook = toStep?.onHighlighted || ctx.getConfig("onHighlighted");
  const deselectedHook = fromStep?.onDeselected || ctx.getConfig("onDeselected");

  const hookOpts = ctx.getHookOpts();

  if (!isFirstHighlight && deselectedHook) {
    deselectedHook(isFromDummyElement ? undefined : fromElement, fromStep!, hookOpts);
  }

  if (highlightStartedHook) {
    highlightStartedHook(isToDummyElement ? undefined : toElement, toStep, hookOpts);
  }

  const hasDelayedPopover = !isFirstHighlight && isAnimatedTour;
  let isPopoverRendered = false;

  hideStepPopover(ctx);

  ctx.setState("previousStep", fromStep);
  ctx.setState("previousElement", fromElement);
  ctx.setState("activeStep", toStep);
  ctx.setState("activeElement", toElement);

  // Where the cutout starts from: the last known stage (mid-animation
  // included) or, on the very first highlight, the element itself.
  const fromRect = ctx.getState("__activeStagePosition") || rectOf(fromElement);
  const isAnimatedTransfer = !!isAnimatedTour && !isFirstHighlight;

  ctx.state.transitioning = isAnimatedTransfer;

  const animate = () => {
    const transitionCallback = ctx.getState("__transitionCallback");

    // This makes sure that the repeated calls to transferHighlight
    // don't interfere with each other. Only the last call will be
    // executed.
    if (transitionCallback !== animate) {
      return;
    }

    const elapsed = Date.now() - start;
    const timeRemaining = duration - elapsed;
    const isHalfwayThrough = timeRemaining <= duration / 2;

    if (toStep.popover && isHalfwayThrough && !isPopoverRendered && hasDelayedPopover) {
      renderStepPopover(ctx, toElement, toStep);
      isPopoverRendered = true;
    }

    if (isAnimatedTransfer && elapsed < duration) {
      transitionStage(ctx, elapsed, duration, fromRect, toElement);
    } else {
      trackActiveElement(ctx, toElement);
      ctx.state.transitioning = false;

      if (highlightedHook) {
        highlightedHook(isToDummyElement ? undefined : toElement, toStep, ctx.getHookOpts());
      }

      ctx.setState("__transitionCallback", undefined);
      ctx.setState("__previousStep", fromStep);
      ctx.setState("__previousElement", fromElement);
      ctx.setState("__activeStep", toStep);
      ctx.setState("__activeElement", toElement);
    }

    window.requestAnimationFrame(animate);
  };

  ctx.setState("__transitionCallback", animate);

  // The first frame runs synchronously so the overlay and the stage render
  // together with the popover; the loop continues on rAF.
  if (isAnimatedTransfer) {
    transitionStage(ctx, 0, duration, fromRect, toElement);
  } else {
    trackActiveElement(ctx, toElement);
  }
  window.requestAnimationFrame(animate);

  bringInView(toElement, ctx.getConfig("smoothScroll"));
  if (!hasDelayedPopover && toStep.popover) {
    renderStepPopover(ctx, toElement, toStep);
  }

  document.querySelectorAll(".driver-active-element-parent").forEach(element => {
    element.classList.remove("driver-active-element-parent", "driver-active-element-parent-no-scroll");
  });

  fromElement.classList.remove("driver-active-element", "driver-no-interaction");
  fromElement.removeAttribute("aria-haspopup");
  fromElement.removeAttribute("aria-expanded");
  fromElement.removeAttribute("aria-controls");

  const disableActiveInteraction = toStep.disableActiveInteraction ?? ctx.getConfig("disableActiveInteraction");
  if (disableActiveInteraction) {
    toElement.classList.add("driver-no-interaction");
  }

  const toParent = toElement.parentElement;
  if (toParent && toParent !== document.body) {
    toParent.classList.add("driver-active-element-parent");

    if (isScrollable(toParent)) {
      toParent.classList.add("driver-active-element-parent-no-scroll");
    }
  }

  toElement.classList.add("driver-active-element");
  toElement.setAttribute("aria-haspopup", "dialog");
  toElement.setAttribute("aria-expanded", "true");
  toElement.setAttribute("aria-controls", "driver-popover-content");
};

export const destroyHighlight = () => {
  document.getElementById(DUMMY_ELEMENT_ID)?.remove();
  document.querySelectorAll(".driver-active-element").forEach(element => {
    const parent = element.parentElement;
    if (parent && parent !== document.body) {
      parent.classList.remove("driver-active-element-parent", "driver-active-element-parent-no-scroll");
    }

    element.classList.remove("driver-active-element", "driver-no-interaction");
    element.removeAttribute("aria-haspopup");
    element.removeAttribute("aria-expanded");
    element.removeAttribute("aria-controls");
  });
};
