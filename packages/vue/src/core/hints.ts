import { shallowReactive } from "vue";
import type { Alignment, PopoverDOM, PopoverRenderModel, Side, StageRect } from "../types";
import { isBrowser, resolveElement } from "./utils";

// The hints module: beacons pinned to elements that open a popover on click.
// Ported from driver.js hints.ts; the engine keeps the reactive HintsState and
// <DriverHints> renders beacons, overlay and popover from it.

// The cutout around the active hint's element, mirroring the tour's defaults.
export const HINT_OVERLAY_PADDING = 10;
export const HINT_OVERLAY_RADIUS = 5;

export type HintBeacon = {
  // Which edge of the element the beacon sits on, and where along that edge.
  // Together they give the twelve anchor points of the element's box.
  side?: Side;
  align?: Alignment;
  animate?: boolean;
  className?: string;

  // Nudge the beacon in pixels from its computed anchor point. Positive
  // offsetX moves it right, negative left; positive offsetY moves it down,
  // negative up. Handy for fine-tuning placement on large or irregular targets.
  offsetX?: number;
  offsetY?: number;
};

export type HintPopover = {
  title?: string;
  description?: string;
  side?: Side;
  align?: Alignment;
  popoverClass?: string;

  // The dismiss button. Hidden with `showButton: false`, leaving a popover
  // that is only dismissed programmatically.
  showButton?: boolean;
  buttonText?: string;

  // Runs instead of dismissing when the button is clicked, like a tour's
  // onNextClick takes over the default advance. Call dismiss() yourself to
  // also remove the hint.
  onButtonClick?: HintHook;

  onPopoverRender?: (popover: PopoverDOM, opts: { hint: DriverHint; hints: Hints }) => void;

  /** driver-vue addition: a Vue component rendered as the popover body. */
  component?: PopoverRenderModel["component"];
  /** driver-vue addition: extra props passed to `component`. */
  props?: Record<string, unknown>;
};

export type HintHook = (element: Element, hint: DriverHint, opts: { config: HintsConfig; hints: Hints }) => void;

export type DriverHint = {
  element: string | Element | (() => Element);

  // Stable identity for open/dismiss/restore and for persisting dismissals.
  // Defaults to the hint's index in the array.
  id?: string;

  beacon?: HintBeacon;
  popover?: HintPopover;

  onOpen?: HintHook;
  onDismiss?: HintHook;

  data?: Record<string, any>;
};

export type HintsConfig = {
  hints?: DriverHint[];

  // Defaults for every hint; a hint's own values win.
  beacon?: HintBeacon;
  buttonText?: string;
  popoverClass?: string;
  popoverOffset?: number;

  // Dim the page while a hint is open, with the hint's element cut out like a
  // tour step. The popover then anchors to the element, the open hint's beacon
  // steps aside, and the other beacons wait under the dim; clicking the dimmed
  // page closes the hint.
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;

  onOpen?: HintHook;
  onDismiss?: HintHook;
  onButtonClick?: HintHook;

  /** driver-vue addition: where `<DriverHints>` teleports its UI. (default: "body") */
  teleportTo?: string | Element;
  /** driver-vue addition: base z-index (the tour's default is 10000). */
  zIndex?: number;
};

/** A hint currently on the page, as rendered by `<DriverHints>`. */
export type MountedHint = {
  id: string;
  hint: DriverHint;
  element: Element;
  /** The beacon's anchor point, in viewport coordinates (the beacon is centered on it). */
  x: number;
  y: number;
  /** The element scrolled out of view; the beacon is hidden. */
  hidden: boolean;
  /** This hint's popover is open. */
  expanded: boolean;
  className: string;
  animate: boolean;
  label: string;
};

export type HintsState = {
  isVisible: boolean;
  activeId?: string;
  mounted: MountedHint[];
  /** The open hint's popover, or undefined. */
  popover?: PopoverRenderModel;
  /** What the popover points at: the element (overlay mode) or the beacon. */
  popoverAnchor?: Element | StageRect;
  /** The active element's rect while the overlay is shown. */
  overlayRect?: StageRect;
  refreshTick: number;
};

export type HintsInternal = {
  registerBeacon: (id: string, element: HTMLElement) => void;
  unregisterBeacon: (id: string) => void;
  reportPopoverDom: (dom: PopoverDOM) => void;
  clearPopoverDom: (dom: PopoverDOM) => void;
};

export interface Hints {
  show: () => void;
  hide: () => void;
  open: (id: string | number) => void;
  close: () => void;
  toggle: (id: string | number) => void;
  dismiss: (id: string | number) => void;
  restore: (id: string | number) => void;
  restoreAll: () => void;
  setHints: (hints: DriverHint[]) => void;
  getHints: () => DriverHint[];
  getActive: () => DriverHint | undefined;
  isVisible: () => boolean;
  refresh: () => void;
  getConfig: () => HintsConfig;

  /** driver-vue addition: the reactive state rendered by `<DriverHints>`. */
  readonly state: Readonly<HintsState>;
  /** @internal */
  readonly __internal: HintsInternal;
}

let popoverKey = 0;

export const createHints = (config: HintsConfig = {}): Hints => {
  const currentConfig: HintsConfig = { ...config };
  const dismissed = new Set<string>();
  const beacons = new Map<string, HTMLElement>();
  const observers = new Map<string, IntersectionObserver>();
  let teardown: (() => void)[] = [];
  let refreshTimeout: number | undefined;
  let popoverDom: PopoverDOM | undefined;

  const state = shallowReactive<HintsState>({
    isVisible: false,
    activeId: undefined,
    mounted: [],
    popover: undefined,
    popoverAnchor: undefined,
    overlayRect: undefined,
    refreshTick: 0,
  });

  const hintId = (hint: DriverHint, index: number): string => hint.id ?? `${index}`;

  const find = (id: string | number): MountedHint | undefined => state.mounted.find(entry => entry.id === `${id}`);

  const beaconConfig = (hint: DriverHint): HintBeacon => ({ ...currentConfig.beacon, ...hint.beacon });

  // The beacon is centered on its anchor point by CSS, so this only has to
  // find the point itself.
  const positionBeacon = (entry: MountedHint) => {
    const { side = "top", align = "end", offsetX = 0, offsetY = 0 } = beaconConfig(entry.hint);
    const rect = entry.element.getBoundingClientRect();

    let top: number;
    let left: number;

    if (side === "top" || side === "bottom") {
      top = side === "top" ? rect.top : rect.bottom;
      left = align === "start" ? rect.left : align === "center" ? rect.left + rect.width / 2 : rect.right;
    } else {
      left = side === "left" ? rect.left : rect.right;
      top = align === "start" ? rect.top : align === "center" ? rect.top + rect.height / 2 : rect.bottom;
    }

    entry.x = left + offsetX;
    entry.y = top + offsetY;
  };

  // Hide the beacon when its element scrolls out of view (or out of a
  // scrollable container), so it never floats over unrelated UI.
  const observeVisibility = (entry: MountedHint) => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(([intersection]) => {
      entry.hidden = !intersection.isIntersecting;

      if (!intersection.isIntersecting && state.activeId === entry.id) {
        close();
      }
    });

    observer.observe(entry.element);
    observers.set(entry.id, observer);
  };

  const mountHint = (hint: DriverHint, id: string) => {
    // A hint without an anchor has nothing to point at. It is skipped rather
    // than centered like a tour's element-less popover, and picked up on the
    // next show() if the element appears later.
    const element = resolveElement(hint.element);
    if (!element) {
      return;
    }

    const { animate, className } = beaconConfig(hint);

    const entry = shallowReactive<MountedHint>({
      id,
      hint,
      element,
      x: 0,
      y: 0,
      hidden: false,
      expanded: false,
      className: className || "",
      animate: animate !== false,
      label: hint.popover?.title || "Show hint",
    });

    positionBeacon(entry);
    state.mounted = [...state.mounted, entry];
    observeVisibility(entry);
  };

  const mountHints = () => {
    (currentConfig.hints || []).forEach((hint, index) => {
      const id = hintId(hint, index);
      if (dismissed.has(id) || find(id)) {
        return;
      }

      mountHint(hint, id);
    });
  };

  const unmountHint = (entry: MountedHint) => {
    observers.get(entry.id)?.disconnect();
    observers.delete(entry.id);
    beacons.delete(entry.id);
  };

  const unmountHints = () => {
    state.mounted.forEach(unmountHint);
    state.mounted = [];
  };

  const requireRefresh = () => {
    if (refreshTimeout) {
      window.cancelAnimationFrame(refreshTimeout);
    }

    refreshTimeout = window.requestAnimationFrame(() => refresh());
  };

  const bindListeners = () => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!state.activeId) {
        return;
      }

      const target = event.target as Node;
      // Clicks on the popover keep it open; clicks on a beacon are already
      // handled by the beacon itself (which toggles or swaps the popover).
      if (popoverDom?.wrapper.contains(target) || [...beacons.values()].some(beacon => beacon.contains(target))) {
        return;
      }

      close();
    };

    const onKeyup = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !state.activeId) {
        return;
      }

      // Escape came from the keyboard, so send focus back where it started.
      const beacon = beacons.get(state.activeId);
      close();
      beacon?.focus();
    };

    // Capture, so scrolling inside a nested container repositions the beacons
    // too; those events never reach the window during the bubble phase.
    window.addEventListener("scroll", requireRefresh, true);
    window.addEventListener("resize", requireRefresh);
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("keyup", onKeyup);

    teardown = [
      () => window.removeEventListener("scroll", requireRefresh, true),
      () => window.removeEventListener("resize", requireRefresh),
      () => document.removeEventListener("click", onDocumentClick),
      () => window.removeEventListener("keyup", onKeyup),
    ];

    // A tour takes over the screen, so an open hint steps aside. The tour
    // marks the body while it runs, which lets this work with any driver
    // instance without the two knowing about each other. The beacons
    // themselves are hidden by CSS off the same marker.
    if (typeof MutationObserver === "undefined") {
      return;
    }

    const tourObserver = new MutationObserver(() => {
      if (!document.body.classList.contains("driver-active")) {
        return;
      }

      close();
    });

    tourObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    teardown.push(() => tourObserver.disconnect());
  };

  const rectOf = (element: Element): StageRect => {
    const rect = element.getBoundingClientRect();

    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  };

  // With the overlay, the popover anchors to the element like a tour step;
  // without it, to the beacon.
  const popoverAnchor = (entry: MountedHint): Element | StageRect => {
    if (currentConfig.overlay) {
      return entry.element;
    }

    return beacons.get(entry.id) ?? { x: entry.x, y: entry.y, width: 0, height: 0 };
  };

  const popoverModel = (entry: MountedHint): PopoverRenderModel => {
    const hintPopover = entry.hint.popover || {};
    const showButton = hintPopover.showButton ?? true;
    const noop = () => {};

    return {
      key: ++popoverKey,

      title: hintPopover.title,
      description: hintPopover.description,

      // A hint is a single self-contained callout: one dismiss button, no
      // navigation, no progress, and no separate close button.
      showButtons: showButton ? ["next"] : [],
      disableButtons: [],
      showProgress: false,
      progressText: "",
      nextBtnText: hintPopover.buttonText ?? currentConfig.buttonText ?? "Got it",
      prevBtnText: "",
      doneButton: false,

      popoverClass: hintPopover.popoverClass || currentConfig.popoverClass || "",

      side: hintPopover.side || "bottom",
      align: hintPopover.align || "start",
      offset: currentConfig.popoverOffset ?? 10,
      // Overlay mode reads like a tour step: the popover clears the cutout
      // ring and lines up with its edge.
      padding: currentConfig.overlay ? HINT_OVERLAY_PADDING : 0,
      centered: false,
      smoothScroll: false,

      component: hintPopover.component,
      componentProps: hintPopover.props,

      // Resolved at click time so a hook set after render is still picked up.
      onNextClick: () => {
        const onButtonClick = hintPopover.onButtonClick || currentConfig.onButtonClick;
        if (onButtonClick) {
          return onButtonClick(entry.element, entry.hint, { config: currentConfig, hints: api });
        }

        dismiss(entry.id);
      },
      onPrevClick: noop,
      onCloseClick: noop,
    };
  };

  const close = () => {
    if (!state.activeId) {
      return;
    }

    const entry = find(state.activeId);
    if (entry) {
      entry.expanded = false;
    }

    state.popover = undefined;
    state.popoverAnchor = undefined;
    state.overlayRect = undefined;
    state.activeId = undefined;
    popoverDom = undefined;
  };

  const open = (id: string | number) => {
    const entry = find(id);
    if (!entry) {
      return;
    }

    // Only one hint is open at a time; opening another swaps it out.
    close();

    state.activeId = entry.id;
    entry.expanded = true;

    if (currentConfig.overlay) {
      state.overlayRect = rectOf(entry.element);
    }

    state.popoverAnchor = popoverAnchor(entry);
    state.popover = popoverModel(entry);

    const onOpen = entry.hint.onOpen || currentConfig.onOpen;
    onOpen?.(entry.element, entry.hint, { config: currentConfig, hints: api });
  };

  const toggle = (id: string | number) => {
    if (state.activeId === `${id}`) {
      close();
      return;
    }

    open(id);
  };

  const dismiss = (id: string | number) => {
    const entry = find(id);
    if (!entry) {
      return;
    }

    if (state.activeId === entry.id) {
      close();
    }

    dismissed.add(entry.id);

    unmountHint(entry);
    state.mounted = state.mounted.filter(mountedEntry => mountedEntry !== entry);

    const onDismiss = entry.hint.onDismiss || currentConfig.onDismiss;
    onDismiss?.(entry.element, entry.hint, { config: currentConfig, hints: api });
  };

  const restore = (id: string | number) => {
    const key = `${id}`;
    if (!dismissed.delete(key) || !state.isVisible || find(key)) {
      return;
    }

    const list = currentConfig.hints || [];
    const index = list.findIndex((hint, hintIndex) => hintId(hint, hintIndex) === key);
    if (index === -1) {
      return;
    }

    mountHint(list[index], key);
  };

  // Bring back every dismissed hint at once; the bulk counterpart to restore().
  const restoreAll = () => {
    dismissed.clear();
    if (state.isVisible) {
      mountHints();
    }
  };

  const refresh = () => {
    state.mounted.forEach(positionBeacon);

    const active = state.activeId ? find(state.activeId) : undefined;
    if (!active || !state.popover) {
      return;
    }

    if (currentConfig.overlay) {
      state.overlayRect = rectOf(active.element);
    }

    state.popoverAnchor = popoverAnchor(active);
    state.refreshTick++;
  };

  const show = () => {
    if (!isBrowser) {
      return;
    }

    if (!state.isVisible) {
      state.isVisible = true;
      bindListeners();
    }

    // mountHints() skips what is already on the page, so calling show() again
    // picks up hints whose elements have appeared since.
    mountHints();
    refresh();
  };

  const hide = () => {
    if (!state.isVisible) {
      return;
    }

    state.isVisible = false;
    close();
    unmountHints();

    teardown.forEach(off => off());
    teardown = [];

    if (!refreshTimeout) {
      return;
    }

    window.cancelAnimationFrame(refreshTimeout);
    refreshTimeout = undefined;
  };

  const setHints = (list: DriverHint[]) => {
    currentConfig.hints = list;
    dismissed.clear();

    if (!state.isVisible) {
      return;
    }

    close();
    unmountHints();
    mountHints();
  };

  const api: Hints = {
    show,
    hide,
    open,
    close,
    toggle,
    dismiss,
    restore,
    restoreAll,
    setHints,
    getHints: () => currentConfig.hints || [],
    getActive: () => (state.activeId ? find(state.activeId)?.hint : undefined),
    isVisible: () => state.isVisible,
    refresh,
    getConfig: () => currentConfig,

    state,
    __internal: {
      registerBeacon: (id, element) => {
        beacons.set(id, element);
        // The popover of a hint opened before its beacon mounted anchors to a
        // point; switch it to the real beacon now.
        if (state.activeId === id && !currentConfig.overlay && state.popover) {
          state.popoverAnchor = element;
        }
      },
      unregisterBeacon: id => {
        beacons.delete(id);
      },
      reportPopoverDom: dom => {
        popoverDom = dom;
        const entry = state.activeId ? find(state.activeId) : undefined;
        if (!entry) {
          return;
        }

        entry.hint.popover?.onPopoverRender?.(dom, { hint: entry.hint, hints: api });
      },
      clearPopoverDom: dom => {
        if (popoverDom === dom) {
          popoverDom = undefined;
        }
      },
    },
  };

  return api;
};

/** driver.js-compatible alias of `createHints`. */
export const hints = createHints;
