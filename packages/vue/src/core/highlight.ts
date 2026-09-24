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

  if (!elemObj) {
    elemObj = mountDummyElement();
  }

  transferHighlight(ctx, elemObj, step);
};

export const trackActiveElement = (ctx: Context, element: Element) => {
  if (!element) {
    return;
  }

  const activeStagePosition = rectOf(element);

  ctx.setState("__activeStagePosition", activeStagePosition);
  ctx.state.stage = activeStagePosition;
};

/**
 * How far the element is past the nearest viewport edge; zero or less while
 * any part of it is on screen.
 */
const distanceOutOfView = (rect: DOMRect): number => {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = document.documentElement.clientHeight || window.innerHeight;

  return Math.max(-rect.bottom, rect.top - height, -rect.right, rect.left - width);
};

/**
 * Emits `scrollAway` once the element has been scrolled out of view, farther
 * than `scrollAwayOffset`. It only counts after the element was on screen for
 * this step (the initial scroll into view is not a departure), and fires once
 * until the element comes back.
 */
const checkScrollAway = (ctx: Context, element: Element) => {
  const behavior = ctx.getConfig("scrollAwayBehavior") ?? "stick";
  if (behavior === "stick" || isDummyElement(element) || ctx.getState("__transitionCallback")) {
    return;
  }

  const distance = distanceOutOfView(element.getBoundingClientRect());
  if (distance <= 0) {
    ctx.setState("__scrollAwayArmed", true);
    return;
  }

  if (!ctx.getState("__scrollAwayArmed") || distance <= (ctx.getConfig("scrollAwayOffset") ?? 0)) {
    return;
  }

  ctx.setState("__scrollAwayArmed", false);
  ctx.emit("scrollAway");
};

export const refreshActiveHighlight = (ctx: Context) => {
  const activeHighlight = ctx.getState("__activeElement");

  if (!activeHighlight) {
    return;
  }

  trackActiveElement(ctx, activeHighlight);
  ctx.state.refreshTick++;
  checkScrollAway(ctx, activeHighlight);
};

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
  ctx.setState("__scrollAwayArmed", false);

  ctx.setState("previousStep", fromStep);
  ctx.setState("previousElement", fromElement);
  ctx.setState("activeStep", toStep);
  ctx.setState("activeElement", toElement);

  const fromRect = ctx.getState("__activeStagePosition") || rectOf(fromElement);
  const isAnimatedTransfer = !!isAnimatedTour && !isFirstHighlight;

  ctx.state.transitioning = isAnimatedTransfer;

  const animate = () => {
    const transitionCallback = ctx.getState("__transitionCallback");

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

      checkScrollAway(ctx, toElement);
    }

    window.requestAnimationFrame(animate);
  };

  ctx.setState("__transitionCallback", animate);

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
