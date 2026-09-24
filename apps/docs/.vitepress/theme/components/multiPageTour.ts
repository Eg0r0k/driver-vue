import { ref } from "vue";
import type { DriveStep } from "driver-vue";

/** A driver.js step plus the route it lives on. */
export type MultiPageStep = DriveStep & { page: string; label: string };

export const PAGE_ONE = "/examples/multi-page-tour";
export const PAGE_TWO = "/examples/multi-page-tour-continued";

export const STORAGE_KEY = "docs-multi-page-tour";

/**
 * The tour position, shared by every page. The VitePress app survives
 * client-side navigation, so a module-level ref survives it too.
 */
export const tourState = ref({ active: false, index: 0 });

export const steps: MultiPageStep[] = [
  {
    page: PAGE_ONE,
    label: "page one",
    element: "#mp-title",
    popover: {
      title: "One tour, two pages",
      description: "The first two steps are on this page. The tour position is stored outside the driver.",
    },
  },
  {
    page: PAGE_ONE,
    label: "page one",
    element: "#mp-export",
    popover: {
      title: "Still page one",
      description: "The next step is on another page. Next saves the position and navigates there.",
      side: "right",
    },
  },
  {
    page: PAGE_TWO,
    label: "page two",
    element: "#mp2-title",
    popover: {
      title: "Page two",
      description: "This page drove the saved step after it mounted.",
    },
  },
  {
    page: PAGE_TWO,
    label: "page two",
    element: "#mp2-share",
    popover: {
      title: "Last step",
      description: "Previous goes back to page one the same way.",
      side: "top",
    },
  },
];
