import { computed, toValue, type CSSProperties, type MaybeRefOrGetter, type Ref } from "vue";
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

// Keep the arrow this far from the popover's corners so it never collides with
// the rounded corners (driver.js ARROW_CORNER_INSET).
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
};

export type UseDriverPositionReturn = {
  /** Inline styles for the popover element (`position: fixed; left; top`). */
  floatingStyles: Ref<CSSProperties>;
  /** Inline styles for the arrow: the offset along the popover's edge. */
  arrowStyles: Ref<CSSProperties>;
  /** The rendered side after flipping, or "over" when centered. */
  side: Ref<Side | "over">;
  /** The rendered alignment. */
  align: Ref<Alignment>;
  /** Re-measure and re-position. */
  update: () => void;
  isPositioned: Ref<boolean>;
};

function toRect(value: Element | StageRect): DOMRect {
  if (value instanceof Element) {
    return value.getBoundingClientRect();
  }

  return new DOMRect(value.x, value.y, value.width, value.height);
}

function expand(rect: DOMRect, padding: number): DOMRect {
  return new DOMRect(rect.x - padding, rect.y - padding, rect.width + padding * 2, rect.height + padding * 2);
}

function toPlacement(side: Side, align: Alignment): Placement {
  return align === "center" ? side : `${side}-${align}`;
}

function fromPlacement(placement: Placement): { side: Side; align: Alignment } {
  const [side, align] = placement.split("-") as [Side, "start" | "end" | undefined];

  return { side, align: align ?? "center" };
}

/**
 * Positions a popover against an element (or a rect) with Floating UI: the
 * requested side flips when there is no room, the popover shifts to stay in
 * the viewport, and the arrow tracks the reference. The rendered side and
 * alignment are exposed so class names can reflect them.
 */
export function useDriverPosition(options: UseDriverPositionOptions): UseDriverPositionReturn {
  const padding = computed(() => toValue(options.padding) ?? 0);
  const isCentered = computed(() => !!toValue(options.centered));

  // A virtual element that reads the live rect of the reference on every
  // update; `contextElement` lets autoUpdate follow ancestor scroll/resize.
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
    shift({ padding: VIEWPORT_PADDING }),
    ...(options.arrow ? [arrow({ element: options.arrow, padding: ARROW_CORNER_INSET })] : []),
  ]);

  const floating = useFloating(reference, options.floating, {
    placement,
    strategy: "fixed",
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
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    return floating.floatingStyles.value as CSSProperties;
  });

  const arrowStyles = computed<CSSProperties>(() => {
    const data = floating.middlewareData.value.arrow;
    if (isCentered.value || !data) {
      return {};
    }

    // The arrow sits on the popover's edge facing the reference; the CSS
    // side class puts it on the right edge, only the offset along it is inline.
    return {
      left: data.x != null ? `${data.x}px` : "",
      top: data.y != null ? `${data.y}px` : "",
    };
  });

  return {
    floatingStyles,
    arrowStyles,
    side,
    align,
    update: floating.update,
    isPositioned: floating.isPositioned,
  };
}
