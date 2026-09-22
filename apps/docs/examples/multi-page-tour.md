# Multi-Page Tour

A driver instance lives on one page: a full page load destroys it, and even in a single-page app the next route's elements do not exist while the current route is showing. So a tour that spans pages is not one long tour — it is a tour whose **position lives outside the driver**, and which is re-driven on every page it reaches.

The reusable shape of that is a composable. Each step carries a `page` on top of the usual driver.js fields:

```ts
const tour = useMultiPageTour({
  steps: [
    { page: "/", element: "#hero", popover: { title: "Welcome", description: "..." } },
    { page: "/", element: "#nav-reports", popover: { title: "Reports", description: "..." } },
    { page: "/reports", element: "#report-table", popover: { title: "Your reports", description: "..." } },
    { page: "/settings", element: "#profile-form", popover: { title: "Your profile", description: "..." } },
  ],
});

tour.start();
```

`start()` navigates to the first step's page if you are not on it, then drives. Next and Previous either move within the page or navigate, and the tour picks itself up when the next page mounts.

## Try it

The tour below runs across two docs pages: two steps here, two on the [next page](./multi-page-tour-continued). The badge in the bottom-left corner is the progress indicator a real app would render in its layout — it reads the shared state, so it stays on screen across the navigation.

<MultiPageTourDemo page="one" />

## The composable

Four pieces do the work: the app-wide driver, shared state, per-step navigation hooks, and a route watcher that drives the saved index on the next page.

```ts
// composables/useMultiPageTour.ts
import { nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { injectDriver, type Config, type DriveStep } from "driver-vue";

/** A driver.js step plus the route it lives on. */
export type MultiPageStep = DriveStep & { page: string; label?: string };

const STORAGE_KEY = "app-tour";

/**
 * The position, shared by every page and every component. A module-level ref
 * is enough in a plain Vue app (a Pinia store works just as well); in Nuxt use
 * `useState("app-tour", () => ({ active: false, index: 0 }))` so SSR gets one
 * copy per request. What matters is that it is not owned by a page component.
 */
export const tourState = ref({ active: false, index: 0 });

export const useMultiPageTour = (options: { steps: MultiPageStep[]; config?: Config }) => {
  // The app-wide driver installed by DriverPlugin, rendered by the
  // <DriverTour /> in your layout. `useDriver(config, { shared: true })` is
  // the same instance. A page-owned driver would be destroyed by navigation.
  const driver = injectDriver();
  const router = useRouter();
  const route = useRoute();

  // Set while the tour navigates: the destroy that comes with the hand-off is
  // not the reader leaving the tour, so onDestroyed must not clear the state.
  let navigating = false;

  const save = () => {
    if (tourState.value.active) {
      localStorage.setItem(STORAGE_KEY, String(tourState.value.index));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const stop = () => {
    tourState.value = { active: false, index: 0 };
    save();
    driver.value.destroy();
  };

  const goTo = (index: number) => {
    const step = options.steps[index];
    if (!step) {
      stop();
      return;
    }

    const from = tourState.value.index;
    tourState.value = { active: true, index };
    save();

    // Within the page: an ordinary move.
    if (step.page === route.path) {
      if (index > from) {
        driver.value.moveNext();
      } else {
        driver.value.movePrevious();
      }
      return;
    }

    // Another page: the target index is already saved, so tear the tour down
    // and navigate. The watch below drives it when that page is mounted.
    navigating = true;
    driver.value.destroy();
    router.push(step.page);
  };

  // Every step takes over its own next/prev buttons, so the two cases above
  // are the only way the tour moves.
  const config = (): Config => ({
    ...options.config,
    steps: options.steps.map((step, index) => ({
      ...step,
      popover: {
        ...step.popover,
        onNextClick: () => goTo(index + 1),
        onPrevClick: () => goTo(index - 1),
      },
    })),
    onDestroyed: () => {
      if (navigating) {
        return; // a hand-off, not the end
      }
      tourState.value = { active: false, index: 0 };
      options.config?.onDestroyed?.();
      save();
    },
  });

  const resume = async () => {
    const step = options.steps[tourState.value.index];
    if (!tourState.value.active || !step || step.page !== route.path) {
      return;
    }

    // Wait for the page to render its elements before the driver looks for
    // them. `waitForElement` on the step covers slower, data-driven pages.
    await nextTick();
    driver.value.setConfig(config());
    driver.value.drive(tourState.value.index);
  };

  const start = (index = 0) => {
    tourState.value = { active: true, index };
    save();

    if (options.steps[index].page === route.path) {
      void resume();
      return;
    }

    navigating = true;
    router.push(options.steps[index].page);
  };

  // The route settled on the page the saved step lives on: drive it.
  watch(
    () => route.path,
    () => {
      navigating = false;
      void resume();
    },
    { immediate: true }
  );

  return { start, stop, goTo, state: tourState, steps: options.steps };
};
```

Call it once, in the layout that also renders `<DriverTour />`:

```vue
<!-- layouts/default.vue -->
<script setup lang="ts">
import { DriverTour } from "driver-vue";
import { useMultiPageTour } from "@/composables/useMultiPageTour";
import { tourSteps } from "@/tour";

const tour = useMultiPageTour({ steps: tourSteps, config: { showProgress: true } });
</script>

<template>
  <slot />
  <TourProgress :tour="tour" />
  <DriverTour />
</template>
```

## Resuming after a reload

`save()` mirrors the position into `localStorage`, so a full page load (or a link that leaves the SPA) resumes instead of losing the tour. Read it back before the first `resume()`:

```ts
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!tourState.value.active && saved !== null) {
    tourState.value = { active: true, index: Number(saved) };
  }
});
```

Storing an index couples the saved value to the order of the steps. In a tour that changes between releases, give each step an `id` and store that instead, looking the index up when resuming — a stale id then simply ends the tour rather than pointing at the wrong step.

## A progress indicator in the layout

Because the position is shared state and not driver state, anything can read it — including while the tour is torn down mid-navigation:

```vue
<!-- components/TourProgress.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { tourState } from "@/composables/useMultiPageTour";
import { tourSteps } from "@/tour";

const step = computed(() => tourSteps[tourState.value.index]);
</script>

<template>
  <!-- `driver-interactive` keeps the Exit button clickable while the tour
       dims the page; see Headless for why. -->
  <aside v-if="tourState.active" class="tour-progress driver-interactive">
    Tour · step {{ tourState.index + 1 }} of {{ tourSteps.length }} · {{ step?.label }}
    <button @click="stop">Exit</button>
  </aside>
</template>

<style scoped>
.tour-progress {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: calc(var(--driver-z-index, 10000) + 3);
}
</style>
```

## Notes

- **Use the shared driver.** `useDriver` destroys its tour when its component unmounts, so a driver owned by a page component dies on navigation — mid-tour, that is exactly wrong. `useDriver(config, { shared: true })`, `injectDriver()` or a `createDriver` in a module survive.
- **`await nextTick()` before driving.** The route changes before the new page has rendered. For pages that fetch their data first, add `waitForElement: 5000` to the first step on that page; the tour then waits instead of falling back to the centered popover. See [Interactive Tour](./interactive-tour).
- **Let real links navigate.** When the highlighted element is itself the link to the next page, `advanceOnClick: true` plus `onNextClick` gives you both: the click navigates and the tour saves the next index. The buttons can be hidden with `showButtons: ["close"]` so the only way on is the link.
- **Full page loads need nothing extra.** The browser tears the tour down for you; the `localStorage` resume above is what brings it back.
- A live version of the same pattern, on real routes with `<NuxtLink>` and `useState`, is in the Nuxt playground (`apps/nuxt-playground`, pages under `/multi-page`). Its `composables/useMultiPageTour.ts` is the composable above with three additions worth copying: the `navigating` flag lives in the shared state rather than in a closure (so any component can hand off), a `storageKey` option, and a `pause()` that tears the highlight down — without forgetting the index — when the reader wanders off the tour's pages and resumes it when they come back.
