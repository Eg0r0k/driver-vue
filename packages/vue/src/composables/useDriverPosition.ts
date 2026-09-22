import { computed, shallowRef, toValue, watch, type CSSProperties, type MaybeRefOrGetter, type Ref } from "vue";
import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
  type VirtualElement,
} from "@floating-ui/vue";
import type { Alignment, Side, StageRect } from "../types";

export const ARROW_CORNER_INSET = 15;

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
   * the arrow moves to the perpendicular edge facing the reference.
   */
  arrowSide: Ref<Side | "over">;
  /** The rendered alignment. */
  align: Ref<Alignment>;
  /** Re-measure and re-position. */
  update: () => void;
  isPositioned: Ref<boolean>;
};

const toRect = (value: Element | StageRect): DOMRect => {
  if (value instanceof Element) {
    return value.getBoundingClientRect();
  }

  return new DOMRect(value.x, value.y, value.width, value.height);
};

const expand = (rect: DOMRect, padding: number): DOMRect =>
  new DOMRect(rect.x - padding, rect.y - padding, rect.width + padding * 2, rect.height + padding * 2);

const toPlacement = (side: Side, align: Alignment): Placement => (align === "center" ? side : `${side}-${align}`);

type Box = { top: number; bottom: number; left: number; right: number };

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

export const arrowOffsetAlong = (
  elementStart: number,
  elementEnd: number,
  popoverStart: number,
  popoverEnd: number,
  arrowSize: number
): number => {
  const length = popoverEnd - popoverStart;
  const overlapStart = Math.min(Math.max(elementStart, popoverStart), popoverEnd);
  const overlapEnd = Math.min(Math.max(elementEnd, popoverStart), popoverEnd);
  const target = (overlapStart + overlapEnd) / 2 - popoverStart;

  const minOffset = ARROW_CORNER_INSET;
  const maxOffset = length - ARROW_CORNER_INSET - arrowSize;
  if (maxOffset < minOffset) {
    return Math.max(0, (length - arrowSize) / 2);
  }

  return Math.min(Math.max(target - arrowSize / 2, minOffset), maxOffset);
};

const fromPlacement = (placement: Placement): { side: Side; align: Alignment } => {
  const [side, align] = placement.split("-") as [Side, "start" | "end" | undefined];

  return { side, align: align ?? "center" };
};

/**
 * Positions a popover against an element (or a rect) with Floating UI: the
 * requested side flips when there is no room, the popover shifts to stay in
 * the viewport, and the arrow tracks the reference. The rendered side and
 * alignment are exposed so class names can reflect them.
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

  const middleware = computed(() => [
    offset(toValue(options.offset) ?? 0),
    flip({ padding: VIEWPORT_PADDING }),
    shift({ padding: VIEWPORT_PADDING, crossAxis: true }),
    ...(options.arrow ? [arrow({ element: options.arrow, padding: ARROW_CORNER_INSET })] : []),
  ]);

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

  const boxes = shallowRef<{ element: Box; popover: Box } | undefined>();

  watch(
    [() => floating.x.value, () => floating.y.value, floating.isPositioned, isCentered],
    () => {
      const value = toValue(options.reference);
      const el = options.floating.value;
      if (isCentered.value || !value || !el || !floating.isPositioned.value) {
        boxes.value = undefined;
        return;
      }

      boxes.value = { element: expand(toRect(value), padding.value), popover: el.getBoundingClientRect() };
    },
    { flush: "post" }
  );

  const arrowSide = computed<Side | "over">(() => {
    if (isCentered.value) {
      return "over";
    }

    const current = boxes.value;
    if (!current) {
      return rendered.value.side;
    }

    return resolveArrowSide(rendered.value.side, current.element, current.popover);
  });

  const arrowStyles = computed<CSSProperties>(() => {
    const data = floating.middlewareData.value.arrow;
    if (isCentered.value || !data) {
      return {};
    }

    if (arrowSide.value === rendered.value.side || !boxes.value) {
      return {
        left: data.x != null ? `${data.x}px` : "",
        top: data.y != null ? `${data.y}px` : "",
      };
    }

    const { element, popover } = boxes.value;
    const size = options.arrow?.value?.getBoundingClientRect().width || 10;
    if (arrowSide.value === "top" || arrowSide.value === "bottom") {
      return { left: `${arrowOffsetAlong(element.left, element.right, popover.left, popover.right, size)}px`, top: "" };
    }

    return { left: "", top: `${arrowOffsetAlong(element.top, element.bottom, popover.top, popover.bottom, size)}px` };
  });

  return {
    floatingStyles,
    arrowStyles,
    side,
    arrowSide,
    align,
    update: floating.update,
    isPositioned: floating.isPositioned,
  };
};
