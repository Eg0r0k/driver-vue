import "./style.css";

export { createDriver, driver } from "./core/driver";
export { generateStageSvgPathString, getPaddedStage } from "./core/stage";
export { easeInOutQuad } from "./core/utils";

export { useDriver } from "./composables/useDriver";
export type { UseDriverOptions, UseDriverReturn } from "./composables/useDriver";
export { useDriverPosition, ARROW_CORNER_INSET, VIEWPORT_PADDING } from "./composables/useDriverPosition";
export type { UseDriverPositionOptions, UseDriverPositionReturn } from "./composables/useDriverPosition";

export {
  DriverPlugin,
  createDriverPlugin,
  provideDriver,
  injectDriver,
  injectDriverDefaults,
  DRIVER_KEY,
  DRIVER_DEFAULTS_KEY,
} from "./plugin";
export type { DriverPluginOptions } from "./plugin";

export { default as DriverTour } from "./components/DriverTour.vue";
export { default as DriverPopover } from "./components/DriverPopover.vue";
export { default as DriverOverlay } from "./components/DriverOverlay.vue";
export { default as DriverStage } from "./components/DriverStage.vue";
export type { TourSlotProps, TourScope, PopoverSlotProps, OverlaySlotProps, StageSlotProps } from "./components/types";

export type * from "./types";
