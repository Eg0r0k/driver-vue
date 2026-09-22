import { ref } from "vue";
import type { DriveStep } from "driver-vue";

/** A driver.js step plus the route it lives on. */
export type MultiPageStep = DriveStep & { page: string; label: string };

export const PAGE_ONE = "/examples/multi-page-tour";
export const PAGE_TWO = "/examples/multi-page-tour-continued";

export const STORAGE_KEY = "docs-multi-page-tour";

/**
 * The tour position, shared by every page. A module-level ref is all it takes
 * outside Nuxt (there, `useState()` keeps it per request); the VitePress theme
 * app survives client-side navigation, so this survives it too.
 */
export const tourState = ref({ active: false, index: 0 });

export const steps: MultiPageStep[] = [
  {
    page: PAGE_ONE,
    label: "Dashboard",
    element: "#mp-title",
    popover: {
      title: "One tour, two pages",
      description: "The first two steps live on this page. The tour position is kept outside the driver.",
    },
  },
  {
    page: PAGE_ONE,
    label: "Dashboard",
    element: "#mp-export",
    popover: {
      title: "Still page one",
      description: "Next moves inside the page, so the driver just moves to the next step.",
      side: "right",
    },
  },
  {
    page: PAGE_TWO,
    label: "Settings",
    element: "#mp2-title",
    popover: {
      title: "Page two",
      description: "Next navigated here, then drove the saved index once this page had mounted.",
    },
  },
  {
    page: PAGE_TWO,
    label: "Settings",
    element: "#mp2-share",
    popover: {
      title: "Last step",
      description: "Previous crosses back to page one the same way.",
      side: "top",
    },
  },
];
