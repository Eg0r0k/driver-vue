# Multi-Page Tour

A driver runs a tour on the page that is currently rendered. A full page load destroys it, and in a single-page app the elements of the next route do not exist while the current route is shown. A tour across pages therefore keeps its position outside the driver and drives the saved step again on each page it reaches.

The composable below does that. Each step has a `page` in addition to the usual step fields:

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

`start()` goes to the first step's page if needed and drives it. Next and Previous move within the page, or save the new position and navigate; the target page then drives the saved step.

## Demo

This tour has two steps on this page and two on the [next page](./multi-page-tour-continued). The badge in the bottom-left corner reads the shared position, so it stays on screen during the navigation. In a real app it would be rendered by the layout.

<MultiPageTourDemo page="one" />

## The composable

```ts
// composables/useMultiPageTour.ts
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { injectDriver, type Config, type DriveStep } from "driver-vue";

export type MultiPageStep = DriveStep & { page: string; label?: string };

const STORAGE_KEY = "app-tour";

// Shared by every page and component. A Pinia store works too. In Nuxt, use
// useState("app-tour", () => ({ active: false, index: 0 })) so that each SSR
// request gets its own copy.
export const tourState = ref({ active: false, index: 0 });

export const useMultiPageTour = (options: { steps: MultiPageStep[]; config?: Config }) => {
  // The app-wide driver from DriverPlugin, rendered by <DriverTour /> in the
  // layout. A driver owned by a page component is destroyed on navigation.
  const driver = injectDriver();
  const router = useRouter();
  const route = useRoute();

  // True while the tour navigates, so that the destroy that comes with it
  // does not clear the saved position.
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

    if (step.page === route.path) {
      if (index > from) {
        driver.value.moveNext();
      } else {
        driver.value.movePrevious();
      }
      return;
    }

    navigating = true;
    driver.value.destroy();
    router.push(step.page);
  };

  // Every step overrides its next and previous buttons with goTo().
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
    onDestroyed: (...args) => {
      if (navigating) {
        return;
      }
      tourState.value = { active: false, index: 0 };
      save();
      options.config?.onDestroyed?.(...args);
    },
  });

  const resume = async () => {
    const step = options.steps[tourState.value.index];
    if (!tourState.value.active || !step || step.page !== route.path) {
      return;
    }

    // Let the new page render its elements first.
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

  // After a full page load, continue from the position saved in localStorage.
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!tourState.value.active && saved !== null) {
      tourState.value = { active: true, index: Number(saved) };
    }
    void resume();
  });

  watch(
    () => route.path,
    () => {
      navigating = false;
      void resume();
    }
  );

  return { start, stop, goTo, state: tourState, steps: options.steps };
};
```

Call it once, in the layout that renders `<DriverTour />`, and pass the result to anything that needs to control the tour:

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

The position is plain shared state, so a progress indicator can read it even between two pages, when no driver is active:

```vue
<!-- components/TourProgress.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { useMultiPageTour } from "@/composables/useMultiPageTour";

const props = defineProps<{ tour: ReturnType<typeof useMultiPageTour> }>();

const step = computed(() => props.tour.steps[props.tour.state.value.index]);
</script>

<template>
  <aside v-if="tour.state.value.active" class="tour-progress driver-interactive">
    Step {{ tour.state.value.index + 1 }} of {{ tour.steps.length }}, {{ step?.label }}
    <button @click="tour.stop()">Exit</button>
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

The `driver-interactive` class keeps the Exit button clickable while the tour is active (see [Headless](../styling/headless)).

## Details

The driver has to outlive the page. `useDriver` destroys its tour when its component unmounts, so a driver created in a page component ends the tour on navigation. `injectDriver()`, `useDriver(config, { shared: true })` and a `createDriver()` in a module all survive it.

`nextTick()` is enough when the next page renders its elements right away. When it loads data first, add `waitForElement` to the first step on that page (see [Interactive Tour](./interactive-tour#waiting-for-elements)), otherwise that step falls back to a centered popover.

When the highlighted element is itself the link to the next page, set `advanceOnClick: true` on the step. A click on the element then calls the step's `onNextClick`, which saves the position and navigates. Hide the next button with `showButtons: ["close"]` if the link is to be the only way on.

The saved index depends on the order of the steps. If the steps change between releases, give each step an `id`, save the id and look up its index when resuming, so that a removed step ends the tour instead of resuming at the wrong one.

The composable compares `step.page` with `route.path`. With vue-router this works when the app is served under a base path, because `createWebHistory(base)` strips the base from `route.path` and adds it back in `router.push()`. Code that builds URLs itself (a plain `<a href>`, `window.location`) or reads `location.pathname` has to add or remove the base. The demo on this page does this, since the docs are served under `/driver-vue/` on GitHub Pages and VitePress keeps the base in its route path.

The Nuxt playground in the repository (`apps/nuxt-playground`, pages under `/multi-page`) has a version of this composable that uses `useState` and `<NuxtLink>`. It also keeps the `navigating` flag in the shared state so any component can navigate, takes a `storageKey` option, and has a `pause()` that removes the highlight without forgetting the position when the reader leaves the tour's pages.
