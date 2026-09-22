# Multi-Page Tour

A driver instance lives within a single page: a full page load destroys it, and even in single-page apps the next route's elements do not exist while the current route is showing. The reliable pattern for tours that span navigation is to treat the tour as resumable: persist the step to resume at, let the app navigate normally, and start a fresh tour from the saved step on the next page.

The demo below simulates two "pages" with a tab switch; the tour hands off between them.

<Demo
  id="multi-page"
  button-text="Start on page one"
  :config="{ showProgress: true }"
  :steps="[
    { element: '#mp-title', popover: { title: 'Page one', description: 'The tour starts here. In a real app the next step lives on another route: save progress and navigate.' } },
    { element: '#mp-export', popover: { title: 'Hand-off', description: 'On the real navigation step you would call destroy() and let the click navigate; drive(savedIndex) resumes on the next page.', side: 'right' } },
  ]"
>
  <DemoBox prefix="mp" />
</Demo>

## Saving progress before navigating

Define the tour in a composable so every page can create it. On the step whose click navigates away, use `advanceOnClick` together with an `onNextClick` override: instead of moving to a step that lives on another page, save where to resume and tear the tour down. The link's own click keeps working, so navigation happens naturally.

```ts
// composables/useAppTour.ts
import { useDriver } from "driver-vue";

const TOUR_KEY = "app-tour-step";

export function useAppTour() {
  let isNavigating = false;

  const tour = useDriver({
    steps: [
      {
        element: "#reports-nav",
        popover: { title: "Reports", description: "Your reports live here." },
      },
      {
        element: "#settings-link",
        // Clicking the highlighted link continues the tour and navigates.
        advanceOnClick: true,
        popover: {
          title: "Open settings",
          description: "Click this link to continue on the settings page.",
          showButtons: ["close"],
          onNextClick: () => {
            // The next step lives on another page: save where to resume
            // and let the click's navigation happen naturally.
            isNavigating = true;
            localStorage.setItem(TOUR_KEY, "2");
            tour.destroy();
          },
        },
      },
      // These steps target elements on the settings page. waitForElement
      // absorbs the rendering delay after a client-side route change.
      {
        element: "#profile-form",
        waitForElement: 5000,
        popover: { title: "Your profile", description: "Update your details here." },
      },
      {
        element: "#save-settings",
        popover: { title: "Save", description: "Don't forget to save your changes." },
      },
    ],
    onDestroyed: () => {
      // Finished or exited: clear the saved progress so the tour does not
      // come back on the next visit. Skipped for the hand-off destroy above.
      if (!isNavigating) {
        localStorage.removeItem(TOUR_KEY);
      }
    },
  });

  return tour;
}
```

## Resuming on the next page

In every page (or in a router `afterEach` / a layout's `onMounted`), check for saved progress and resume from it:

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useAppTour } from "@/composables/useAppTour";

const { drive } = useAppTour();

onMounted(() => {
  const savedStep = localStorage.getItem("app-tour-step");
  if (savedStep !== null) {
    drive(Number(savedStep));
  }
});
</script>
```

`drive()` accepts the step index to start from, so the tour picks up exactly where it left off.

## Notes

- The pattern works the same for full page loads and client-side routing (Vue Router, Nuxt). On a full load the browser tears everything down anyway; the explicit `destroy()` in the hand-off matters for single-page apps, where the old page's tour would otherwise stay on screen.
- `useDriver` destroys its tour when the component unmounts, so a tour owned by a page component ends on navigation by itself. A tour that must survive route changes belongs in a layout, a store, or `createDriver` in a module.
- The saved value here is a hardcoded index for clarity. In a larger tour, compute it with `driver.getActiveIndex() + 1`, or store a step id and look up its index when resuming, so reordering steps does not break saved progress.
- If the destination page renders its content asynchronously, `waitForElement` on the first resumed step keeps the tour from falling back to the centered popover while the page hydrates. See [Interactive Tour](./interactive-tour).
