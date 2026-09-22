import type { MultiPageStep } from "~/composables/useMultiPageTour";

/**
 * The tour of the mock app: seven steps across three routes. Every step names
 * the page it belongs to; `useMultiPageTour()` navigates between them and
 * resumes the tour on the other side.
 */
export const multiPageSteps: MultiPageStep[] = [
  {
    page: "/multi-page/dashboard",
    element: "#mp-dashboard-title",
    popover: {
      title: "Welcome to the mock app",
      description:
        "This tour walks through three routes. Its position lives in shared state, not in the driver, so it survives a navigation.",
      side: "bottom",
      align: "start",
    },
  },
  {
    page: "/multi-page/dashboard",
    element: "#mp-stat-revenue",
    popover: {
      title: "One screen at a time",
      description: "Nothing special so far: the driver highlights elements of the page you are on.",
      side: "bottom",
      align: "start",
    },
  },
  {
    page: "/multi-page/dashboard",
    element: "#mp-nav-settings",
    popover: {
      title: "Crossing a page",
      description:
        "Next stores the step index, destroys the tour, navigates to Settings and starts it again there on that index.",
      side: "bottom",
      align: "start",
      nextBtnText: "Next page →",
    },
  },
  {
    page: "/multi-page/settings",
    element: "#mp-workspace-name",
    popover: {
      title: "Picked up on Settings",
      description: "The route watcher resumed the tour here. Previous walks back to the dashboard the same way.",
      side: "right",
      align: "start",
      prevBtnText: "← Previous page",
    },
  },
  {
    page: "/multi-page/settings",
    element: "#mp-save",
    popover: {
      title: "Try reloading",
      description: "The position is mirrored to localStorage, so a full page reload drops you right back on this step.",
      side: "right",
      align: "start",
      nextBtnText: "Next page →",
    },
  },
  {
    page: "/multi-page/profile",
    element: "#mp-profile-card",
    popover: {
      title: "Third route, same tour",
      description: "The bar above the page counts the steps of the whole flow, not of the page you happen to be on.",
      side: "bottom",
      align: "start",
      prevBtnText: "← Previous page",
    },
  },
  {
    page: "/multi-page/profile",
    popover: {
      title: "That's it",
      description: "Seven steps, three pages, one driver. Done clears the stored position.",
    },
  },
];
