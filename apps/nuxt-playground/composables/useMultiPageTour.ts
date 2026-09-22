import { injectDriver, type DriveStep } from "driver-vue";

/** A tour step plus the route it lives on. */
export type MultiPageStep = DriveStep & { page: string };

/** Where the tour is, shared by every page and mirrored to localStorage. */
export type MultiPageTourState = {
  active: boolean;
  index: number;
  /** A step handler is navigating, so the destroy that comes with it is not an exit. */
  navigating: boolean;
};

/** The read-only view rendered by `<TourProgress />`. */
export type MultiPageTourProgress = {
  index: number;
  total: number;
  /** The route the current step belongs to. */
  page: string;
  active: boolean;
};

export type MultiPageTourOptions = {
  steps: MultiPageStep[];
  /** localStorage key the state is mirrored to, so a reload resumes. (default: "driver-vue-multi-page-tour") */
  storageKey?: string;
};

const STATE_KEY = "multi-page-tour";
const DEFAULT_STORAGE_KEY = "driver-vue-multi-page-tour";

const emptyState = (): MultiPageTourState => ({ active: false, index: 0, navigating: false });

const readStored = (storageKey: string): MultiPageTourState | undefined => {
  if (!import.meta.client) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as Partial<MultiPageTourState>;
    if (!parsed?.active || typeof parsed.index !== "number") {
      return undefined;
    }

    return { active: true, index: parsed.index, navigating: false };
  } catch {
    // Unreadable or disabled storage: start fresh.
    return undefined;
  }
};

const writeStored = (storageKey: string, state: MultiPageTourState) => {
  if (!import.meta.client) {
    return;
  }

  try {
    if (state.active) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // Storage disabled: the tour still works, it just does not survive a reload.
  }
};

/**
 * A tour that spans several routes. The position lives in shared state instead
 * of in the driver, so a step can destroy the tour, navigate, and start it
 * again on the next page at the same index.
 *
 * `follow` wires the parts that must exist exactly once (the route watcher and
 * the restore on mount); the layout owns them, other components only read.
 */
const createTour = (steps: MultiPageStep[], storageKey: string, follow: boolean) => {
  const state = useState<MultiPageTourState>(STATE_KEY, emptyState);
  const driver = injectDriver();
  const route = useRoute();

  const persist = () => writeStored(storageKey, state.value);

  const progress = computed<MultiPageTourProgress>(() => ({
    index: state.value.index,
    total: steps.length,
    page: steps[state.value.index]?.page ?? "",
    active: state.value.active,
  }));

  /** Continue on another route: remember the target step, destroy, navigate. */
  const leaveTo = (index: number) => {
    const step = steps[index];
    if (!step) {
      return;
    }

    state.value = { ...state.value, index, navigating: true };
    persist();
    driver.value.destroy();
    void navigateTo(step.page);
  };

  /**
   * The next/previous buttons move the driver when the neighbouring step is on
   * this page and navigate when it is not. The last step keeps the default next
   * button (it is the done button) and the first step the default previous one.
   */
  const withNavigation = (step: MultiPageStep, index: number): DriveStep => {
    const previous = steps[index - 1];
    const next = steps[index + 1];

    return {
      ...step,
      popover: {
        ...step.popover,
        ...(next
          ? { onNextClick: () => (next.page === route.path ? driver.value.moveNext() : leaveTo(index + 1)) }
          : {}),
        ...(previous
          ? { onPrevClick: () => (previous.page === route.path ? driver.value.movePrevious() : leaveTo(index - 1)) }
          : {}),
      },
    };
  };

  const apply = () => {
    driver.value.setConfig({
      animate: true,
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      steps: steps.map(withNavigation),
      onDestroyed: () => {
        // A destroy in the middle of a navigation is part of the tour; every
        // other one (done, close, escape, overlay) ends it.
        if (state.value.navigating) {
          return;
        }

        state.value = emptyState();
        persist();
      },
    });
  };

  /** Pick the tour up on the current route, if that is where it stopped. */
  const resume = async (): Promise<void> => {
    if (!state.value.active) {
      return;
    }

    const step = steps[state.value.index];
    if (!step || step.page !== route.path) {
      return;
    }

    apply();
    await nextTick();
    driver.value.drive(state.value.index);
  };

  /** Stop highlighting without forgetting where the reader was. */
  const pause = () => {
    if (!driver.value.isActive()) {
      return;
    }

    state.value = { ...state.value, navigating: true };
    driver.value.destroy();
    state.value = { ...state.value, navigating: false };
  };

  const start = () => {
    const first = steps[0];
    if (!first) {
      return;
    }

    state.value = { active: true, index: 0, navigating: first.page !== route.path };
    persist();

    if (state.value.navigating) {
      void navigateTo(first.page);
      return;
    }

    void resume();
  };

  const stop = () => {
    state.value = emptyState();
    persist();
    driver.value.destroy();
  };

  if (follow) {
    watch(
      () => route.path,
      () => {
        if (state.value.navigating) {
          state.value = { ...state.value, navigating: false };
          persist();
        }

        if (!state.value.active) {
          return;
        }

        if (steps[state.value.index]?.page === route.path) {
          void resume();
          return;
        }

        // Left the tour's pages on foot: pause, and resume when coming back.
        pause();
      },
      { flush: "post" }
    );

    onMounted(() => {
      // A reload restores the position from localStorage and continues here.
      const stored = readStored(storageKey);
      if (stored) {
        state.value = stored;
      }

      void resume();
    });
  }

  return { progress, start, resume, stop };
};

/**
 * Drives a multi-page tour. Call it once, in the layout: it owns the route
 * watcher that continues the tour after a navigation and the restore that
 * resumes it after a reload.
 *
 * ```ts
 * useMultiPageTour({ steps: multiPageSteps })
 * ```
 */
export const useMultiPageTour = (options: MultiPageTourOptions) =>
  createTour(options.steps, options.storageKey ?? DEFAULT_STORAGE_KEY, true);

/**
 * The same tour without the wiring, for components that only start, stop or
 * display it (`<MultiPageNav>`, `<TourProgress>`).
 */
export const useMultiPageTourControls = (steps: MultiPageStep[], storageKey: string = DEFAULT_STORAGE_KEY) =>
  createTour(steps, storageKey, false);
