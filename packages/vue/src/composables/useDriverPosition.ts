import { computed, toValue, type CSSProperties, type MaybeRefOrGetter, type Ref } from "vue";
import {
  autoUpdate,
  offset,
  shift,
  useFloating,
  type Middleware,
  type Placement,
  type VirtualElement,
} from "@floating-ui/vue";
import type { Alignment, Side, StageRect } from "../types";

export const ARROW_CORNER_INSET = 15;

/** The default arrow is a 10x10 CSS triangle; a larger one is measured from the DOM. */
export const ARROW_SIZE = 10;

/** The viewport padding the popover keeps clear of the edges. */
export const VIEWPORT_PADDING = 10;

export type UseDriverPositionOptions = {
  /** The element (or a static rect) the popover points at. */
  reference: MaybeRefOrGetter<Element | StageRect | undefined | null>;
  /** The popover element. */
  floating: Ref<HTMLElement | null>;
  /** The arrow element, when there is one. */
  arrow?: Ref<HTMLElement | null>;
  side: MaybeRefOrGetter<Side>;
  align: MaybeRefOrGetter<Alignment>;
  /** Gap between the (padded) reference and the popover. */
  offset?: MaybeRefOrGetter<number>;
  /** Expands the reference rect on every side, so the popover clears the stage cutout. */
  padding?: MaybeRefOrGetter<number>;
  /** Ignore the reference and center the popover in the viewport (modal-like). */
  centered?: MaybeRefOrGetter<boolean>;
  /** Positioning only runs while open. */
  open?: MaybeRefOrGetter<boolean>;
  /**
   * `fixed` (default) positions in the viewport; `absolute` positions in the
   * document, so the element scrolls natively with the page. (Floating UI strategy)
   */
  strategy?: "fixed" | "absolute";
};

export type UseDriverPositionReturn = {
  /** Inline styles for the popover element (`position: fixed; left; top`). */
  floatingStyles: Ref<CSSProperties>;
  /** Inline styles for the arrow: the offset along the popover's edge. */
  arrowStyles: Ref<CSSProperties>;
  /** The rendered side after flipping, or "over" when centered. */
  side: Ref<Side | "over">;
  /**
   * The popover edge the arrow sits on, named like the side it corresponds
   * to (`bottom` = on the top edge, pointing up). Usually equal to `side`;
   * when the reference scrolls clear of the popover along the placement axis
   * the arrow moves to the perpendicular edge facing the reference. "over"
   * when there is nothing to point at (centered, or no side has room).
   */
  arrowSide: Ref<Side | "over">;
  /** The rendered alignment. */
  align: Ref<Alignment>;
  /**
   * The reference is entirely outside the viewport. The popover stays pinned
   * to the nearest edge meanwhile, with the arrow pointing the way back.
   */
  referenceHidden: Ref<boolean>;
  /** Re-measure and re-position. */
  update: () => void;
  isPositioned: Ref<boolean>;
};

type Box = { top: number; bottom: number; left: number; right: number };

const toRect = (value: Element | StageRect): DOMRect => {
  if (value instanceof Element) {
    return value.getBoundingClientRect();
  }

  return new DOMRect(value.x, value.y, value.width, value.height);
};

const expand = (rect: DOMRect, padding: number): DOMRect =>
  new DOMRect(rect.x - padding, rect.y - padding, rect.width + padding * 2, rect.height + padding * 2);

const toPlacement = (side: Side, align: Alignment): Placement => (align === "center" ? side : `${side}-${align}`);

const fromPlacement = (placement: Placement): { side: Side; align: Alignment } => {
  const [side, align] = placement.split("-") as [Side, "start" | "end" | undefined];

  return { side, align: align ?? "center" };
};

const viewport = () => ({
  width: document.documentElement.clientWidth || window.innerWidth,
  height: document.documentElement.clientHeight || window.innerHeight,
});

/**
 * The sides tried after the requested one, in order: the opposite side first,
 * then the perpendicular ones. A popover asked for the right of an element on
 * a narrow screen ends up below (or above) it instead of on top of it.
 */
const FALLBACK_SIDES: Record<Side, Side[]> = {
  top: ["bottom", "left", "right"],
  bottom: ["top", "left", "right"],
  left: ["right", "bottom", "top"],
  right: ["left", "bottom", "top"],
};

/** Room between the reference and the viewport edge on one side. */
const spaceOn = (side: Side, reference: Box, view: { width: number; height: number }): number => {
  if (side === "top") {
    return reference.top;
  }

  if (side === "bottom") {
    return view.height - reference.bottom;
  }

  if (side === "left") {
    return reference.left;
  }

  return view.width - reference.right;
};

/**
 * Picks the rendered side the way driver.js does: a side is usable when the
 * space between the reference and the viewport edge holds the popover, and
 * only that axis counts. A reference scrolled above the viewport therefore
 * keeps a `left`/`right` popover on its side (the popover is then pinned to
 * the top edge by `shift`), while a `top` popover moves below it.
 *
 * When no side has room (an element taller than the screen on a phone) the
 * popover detaches: it sits centered at the bottom of the viewport and the
 * arrow is hidden.
 */
const pickSide = (gap: number, padding: number): Middleware => ({
  name: "driverSide",
  fn: ({ placement, initialPlacement, rects, elements }) => {
    const { side: requested, align } = fromPlacement(initialPlacement);
    const reference = elements.reference.getBoundingClientRect();
    const view = viewport();

    // The element itself, without the stage padding, is out of sight.
    const hidden =
      reference.bottom - padding <= 0 ||
      reference.top + padding >= view.height ||
      reference.right - padding <= 0 ||
      reference.left + padding >= view.width;

    const fits = (side: Side) => {
      const size = side === "top" || side === "bottom" ? rects.floating.height : rects.floating.width;
      return spaceOn(side, reference, view) >= size + gap + VIEWPORT_PADDING;
    };

    const chosen = [requested, ...FALLBACK_SIDES[requested]].find(fits);
    const target = chosen ? toPlacement(chosen, align) : initialPlacement;
    if (target !== placement) {
      return { reset: { placement: target } };
    }

    if (chosen) {
      return { data: { detached: false, hidden } };
    }

    // Floating UI coordinates are relative to the offset parent; the viewport
    // position is converted through the reference, which is in both frames.
    const dx = rects.reference.x - reference.left;
    const dy = rects.reference.y - reference.top;

    return {
      x: (view.width - rects.floating.width) / 2 + dx,
      y: view.height - rects.floating.height - VIEWPORT_PADDING + dy,
      data: { detached: true, hidden },
    };
  },
});

/**
 * Resolves the arrow after the popover has its final coordinates: the edge it
 * sits on and its offset along that edge. Runs on every position update, so it
 * follows the reference even while the popover itself stays pinned.
 */
const placeArrow = (arrowSize: () => number): Middleware => ({
  name: "driverArrow",
  fn: ({ x, y, placement, rects, middlewareData }) => {
    if (middlewareData.driverSide?.detached) {
      return { data: { side: "over", offset: 0 } };
    }

    const { side, align } = fromPlacement(placement);
    const element: Box = {
      left: rects.reference.x,
      top: rects.reference.y,
      right: rects.reference.x + rects.reference.width,
      bottom: rects.reference.y + rects.reference.height,
    };
    const popover: Box = { left: x, top: y, right: x + rects.floating.width, bottom: y + rects.floating.height };

    const edge = resolveArrowSide(side, element, popover);
    const size = arrowSize();
    const offset =
      edge === "top" || edge === "bottom"
        ? arrowOffsetAlong(element.left, element.right, popover.left, popover.right, size, align)
        : arrowOffsetAlong(element.top, element.bottom, popover.top, popover.bottom, size, align);

    return { data: { side: edge, offset } };
  },
});

/**
 * Decides which popover edge the arrow sits on. Normally the rendered side,
 * but when the element scrolls clear of the popover along that side's axis
 * (a left-placed popover whose element has scrolled above it), the arrow moves
 * to the perpendicular edge so it keeps pointing at the element.
 */
export const resolveArrowSide = (side: Side, element: Box, popover: Box): Side => {
  if (popover.bottom - popover.top <= 0 || popover.right - popover.left <= 0) {
    return side;
  }

  if (side === "left" || side === "right") {
    const overlapsVertically = element.bottom > popover.top && element.top < popover.bottom;
    if (overlapsVertically) {
      return side;
    }

    return element.bottom <= popover.top ? "bottom" : "top";
  }

  const overlapsHorizontally = element.right > popover.left && element.left < popover.right;
  if (overlapsHorizontally) {
    return side;
  }

  return element.right <= popover.left ? "right" : "left";
};

/**
 * The arrow's offset along one popover edge, relative to the popover's
 * leading edge. It aims at the middle of the stretch where element and
 * popover overlap (or at the nearest corner when they do not overlap) and
 * stays clear of the rounded corners. An element spanning the whole edge
 * leaves the choice to the alignment, so the arrow echoes it.
 */
export const arrowOffsetAlong = (
  elementStart: number,
  elementEnd: number,
  popoverStart: number,
  popoverEnd: number,
  arrowSize: number = ARROW_SIZE,
  align: Alignment = "center"
): number => {
  const length = popoverEnd - popoverStart;
  const minOffset = ARROW_CORNER_INSET;
  const maxOffset = length - ARROW_CORNER_INSET - arrowSize;
  if (maxOffset < minOffset) {
    return Math.max(0, (length - arrowSize) / 2);
  }

  const spansEdge = elementStart <= popoverStart && elementEnd >= popoverEnd;
  if (spansEdge && align !== "center") {
    return align === "start" ? minOffset : maxOffset;
  }

  const overlapStart = Math.min(Math.max(elementStart, popoverStart), popoverEnd);
  const overlapEnd = Math.min(Math.max(elementEnd, popoverStart), popoverEnd);
  const target = (overlapStart + overlapEnd) / 2 - popoverStart;

  return Math.min(Math.max(target - arrowSize / 2, minOffset), maxOffset);
};

/**
 * Positions a popover against an element (or a rect) with Floating UI, with
 * driver.js semantics: the requested side is kept while it has room, then the
 * opposite and the perpendicular sides are tried; the popover shifts to stay
 * in the viewport (so it sticks to the edge while its element scrolls away),
 * and the arrow keeps pointing at the element. The rendered side and alignment
 * are exposed so class names can reflect them.
 */
export const useDriverPosition = (options: UseDriverPositionOptions): UseDriverPositionReturn => {
  const padding = computed(() => toValue(options.padding) ?? 0);
  const isCentered = computed(() => !!toValue(options.centered));

  const reference = computed<VirtualElement | null>(() => {
    const value = toValue(options.reference);
    if (!value || isCentered.value) {
      return null;
    }

    const pad = padding.value;
    const virtual: VirtualElement = {
      getBoundingClientRect: () => expand(toRect(value), pad),
    };

    if (value instanceof Element) {
      virtual.contextElement = value;
    }

    return virtual;
  });

  const placement = computed(() => toPlacement(toValue(options.side), toValue(options.align)));

  const measureArrow = () => options.arrow?.value?.getBoundingClientRect().width || ARROW_SIZE;

  const middleware = computed(() => {
    const gap = toValue(options.offset) ?? 0;

    return [
      offset(gap),
      pickSide(gap, padding.value),
      shift({ padding: VIEWPORT_PADDING, crossAxis: true }),
      placeArrow(measureArrow),
    ];
  });

  const floating = useFloating(reference, options.floating, {
    placement,
    strategy: options.strategy ?? "fixed",
    middleware,
    transform: false,
    open: computed(() => (toValue(options.open) ?? true) && !isCentered.value),
    whileElementsMounted: autoUpdate,
  });

  const rendered = computed(() => fromPlacement(floating.placement.value));

  const side = computed<Side | "over">(() => (isCentered.value ? "over" : rendered.value.side));
  const align = computed(() => rendered.value.align);

  const floatingStyles = computed<CSSProperties>(() => {
    if (isCentered.value) {
      return {
        position: options.strategy ?? "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    return floating.floatingStyles.value as CSSProperties;
  });

  const arrowData = computed(
    () => floating.middlewareData.value.driverArrow as { side: Side | "over"; offset: number } | undefined
  );

  const arrowSide = computed<Side | "over">(() => {
    if (isCentered.value) {
      return "over";
    }

    return arrowData.value?.side ?? rendered.value.side;
  });

  const arrowStyles = computed<CSSProperties>(() => {
    const data = arrowData.value;
    if (isCentered.value || !data || data.side === "over") {
      return {};
    }

    const px = `${data.offset}px`;

    return data.side === "top" || data.side === "bottom" ? { left: px, top: "" } : { left: "", top: px };
  });

  const referenceHidden = computed(
    () => !isCentered.value && !!(floating.middlewareData.value.driverSide as { hidden?: boolean } | undefined)?.hidden
  );

  return {
    floatingStyles,
    arrowStyles,
    side,
    arrowSide,
    align,
    referenceHidden,
    update: floating.update,
    isPositioned: floating.isPositioned,
  };
};
