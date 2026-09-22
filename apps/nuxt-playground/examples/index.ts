import type { ExampleGroup } from "./types";
import { highlightGroup } from "./highlight";
import { popoverGroup } from "./popover";
import { tourGroup } from "./tour";
import { advanceWaitGroup } from "./advance-wait";
import { skipMissingGroup } from "./skip-missing";
import { apiGroup } from "./api";
import { instancesGroup } from "./instances";
import { scrollGroup } from "./scroll";
import { durationGroup } from "./duration";
import { arrowGroup } from "./arrow";

// Data-driven pages: every group gets `/<slug>` with the shared stage and its
// example cards. Hand-written pages (animation, styling, hints, multi-page)
// live in pages/ directly.
export const groups: ExampleGroup[] = [
  highlightGroup,
  popoverGroup,
  tourGroup,
  advanceWaitGroup,
  skipMissingGroup,
  apiGroup,
  instancesGroup,
  scrollGroup,
  durationGroup,
  arrowGroup,
];
