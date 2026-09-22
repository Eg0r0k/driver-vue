import type { CSSProperties } from "vue";
import type { Alignment, Driver, DriveStep, PopoverRenderModel, Side, StageRect } from "../types";

/** What every popover slot and custom popover component receives. */
export type PopoverSlotProps = {
  /** The resolved popover model. */
  popover: PopoverRenderModel;
  /** The rendered side after flipping, "over" when centered. */
  side: Side | "over";
  /** The rendered alignment. */
  align: Alignment;
  /** Inline styles that put the arrow on target; apply to a custom arrow. */
  arrowStyles: CSSProperties;
  next: () => void;
  prev: () => void;
  close: () => void;
};

/** The tour context added by `<DriverTour>` to every slot. */
export type TourScope = {
  driver: Driver;
  /** The active (resolved) step. */
  step: DriveStep;
  /** Index of the active step, -1 for a bare `highlight()`. */
  index: number;
  /** Number of steps in the tour, 0 for a bare `highlight()`. */
  total: number;
  /** The highlighted element; undefined for a centered, element-less step. */
  element?: Element;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TourSlotProps = TourScope & PopoverSlotProps;

/** Scope of the `overlay` slot. */
export type OverlaySlotProps = TourScope & {
  /** The cutout rect, without padding, interpolated while transitioning. */
  stage: StageRect;
  padding: number;
  radius: number;
  color: string;
  opacity: number;
  zIndex: number;
  transitioning: boolean;
  /** The engine animates the stage frame by frame (`config.animate`); false means the rect jumps and CSS may transition it. */
  animated: boolean;
  /** Bumped by `driver.refresh()`; re-measure on change. */
  refreshTick: number;
  /** Call when the dimmed area is clicked (runs `overlayClickBehavior`). */
  onClick: () => void;
};

/** Scope of the `stage` slot. */
export type StageSlotProps = TourScope & {
  stage: StageRect;
  padding: number;
  radius: number;
  transitioning: boolean;
};
