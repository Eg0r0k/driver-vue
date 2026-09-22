import "./style.css";

export { createHints, hints, HINT_OVERLAY_PADDING, HINT_OVERLAY_RADIUS } from "./core/hints";
export type {
  Hints,
  HintsConfig,
  HintsState,
  HintsInternal,
  DriverHint,
  HintBeacon,
  HintPopover,
  HintHook,
  MountedHint,
} from "./core/hints";

export { useHints } from "./composables/useHints";
export type { UseHintsReturn } from "./composables/useHints";

export { default as DriverHints } from "./components/DriverHints.vue";
export type { HintScope, HintSlotProps } from "./components/DriverHints.vue";
export { default as DriverHintBeacon } from "./components/DriverHintBeacon.vue";

export type { Alignment, PopoverDOM, PopoverRenderModel, Side, StageRect } from "./types";
