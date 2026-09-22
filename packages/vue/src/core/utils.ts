import type { DriveStep } from "../types";

export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

export const DUMMY_ELEMENT_ID = "driver-dummy-element";

export const isDummyElement = (element: Element | undefined | null): boolean =>
  !!element && element.id === DUMMY_ELEMENT_ID;

export const resolveElement = (element: DriveStep["element"]): Element | null | undefined => {
  if (typeof element === "function") {
    return element();
  }

  if (typeof element === "string") {
    return isBrowser ? document.querySelector(element) : null;
  }

  return element;
};

export const isScrollable = (element: Element) => {
  const style = window.getComputedStyle(element);
  return [style.overflow, style.overflowX, style.overflowY].some(value => {
    return value === "auto" || value === "scroll";
  });
};

/** The driver.js default easing, in normalized form (t and the result are 0..1). */
export const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const getFocusableElements = (parentEls: Element[] | HTMLElement[]) => {
  const focusableQuery =
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

  return parentEls
    .flatMap(parentEl => {
      const isParentFocusable = parentEl.matches(focusableQuery);
      const focusableEls: HTMLElement[] = Array.from(parentEl.querySelectorAll(focusableQuery));

      return [...(isParentFocusable ? [parentEl as HTMLElement] : []), ...focusableEls];
    })
    .filter(el => {
      return getComputedStyle(el).pointerEvents !== "none" && isElementVisible(el);
    });
};

export const bringInView = (element: Element, shouldSmoothScroll?: boolean) => {
  if (!element || isElementInView(element)) {
    return;
  }

  const isTallerThanViewport = (element as HTMLElement).offsetHeight > window.innerHeight;

  element.scrollIntoView({
    behavior: !shouldSmoothScroll || hasScrollableParent(element) ? "auto" : "smooth",
    inline: "center",
    block: isTallerThanViewport ? "start" : "center",
  });
};

const hasScrollableParent = (e: Element) => {
  if (!e || !e.parentElement) {
    return;
  }

  const parent = e.parentElement as HTMLElement & { scrollTopMax?: number };

  return parent.scrollHeight > parent.clientHeight;
};

const isElementInView = (element: Element) => {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const isElementVisible = (el: HTMLElement) =>
  !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
