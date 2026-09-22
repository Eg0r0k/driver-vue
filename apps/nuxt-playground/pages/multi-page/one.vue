<script setup lang="ts">
useHead({ title: "Multi-page tour (1/2) · driver-vue playground" });

/**
 * A tour that spans two routes. The last step on this page navigates and
 * stores where the tour should resume; page two picks it up on mount. The
 * shared driver is used so the layout's <DriverTour /> renders both halves.
 */
const progress = useState<{ page: "one" | "two"; index: number } | null>("multi-page-step", () => null);
const { log } = useExampleRunner();

const { drive, driver } = useDriver(
  {
    showProgress: true,
    progressText: "Page 1 · {{current}} of {{total}}",
    steps: [
      {
        element: "#mp-hero",
        popover: {
          title: "Page one",
          description: "The tour starts here. Steps on this page target this page's content.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#mp-next-link",
        popover: {
          title: "Crossing pages",
          description: "Next navigates to page two and the tour continues there.",
          side: "top",
          align: "start",
          nextBtnText: "Next page →",
          onNextClick: () => {
            progress.value = { page: "two", index: 0 };
            log("multi-page: navigating to /multi-page/two");
            navigateTo("/multi-page/two");
          },
        },
      },
    ],
    onDestroyed: () => {
      // Destroyed on this page means the reader left the tour (or finished
      // a backwards trip). Navigating away never destroys the shared driver.
      if (progress.value?.page === "one") {
        progress.value = null;
        log("multi-page: tour ended on page one");
      }
    },
  },
  { shared: true }
);

const start = () => {
  progress.value = { page: "one", index: 0 };
  drive(0);
};

onMounted(() => {
  // Coming back from page two ("← Previous page"): resume on the last step.
  if (progress.value?.page === "one" && driver.isActive()) {
    drive(progress.value.index);
  } else if (progress.value?.page === "one") {
    drive(progress.value.index);
  }
});
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>Multi-page tour, page one</h2>
      <p class="fx-hint">
        Tours are not tied to a route: keep the position in shared state (<code>useState</code>), navigate from a step's
        <code>onNextClick</code>, and call <code>drive(index)</code> when the next page mounts.
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="start">Start tour</button>
        <NuxtLink id="mp-next-link" to="/multi-page/two" class="mp-link">Go to page two →</NuxtLink>
      </div>
      <pre class="fx-code">
// page one, last step
onNextClick: () =&gt; {
  progress.value = { page: "two", index: 0 };
  navigateTo("/multi-page/two");
}

// page two
onMounted(() =&gt; {
  if (progress.value?.page === "two") drive(progress.value.index);
});</pre>
    </section>

    <section id="mp-hero" class="mp-card">
      <h3>Dashboard</h3>
      <p>Imagine this is your app's landing page. The first two steps of the tour live here.</p>
      <div class="mp-tiles">
        <div class="mp-tile">Revenue<br /><strong>$12.4k</strong></div>
        <div class="mp-tile">Users<br /><strong>1,208</strong></div>
        <div class="mp-tile">Churn<br /><strong>2.1%</strong></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.mp-link {
  align-self: center;
  color: #4338ca;
  font-weight: 600;
  text-decoration: none;
}

.mp-card {
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.mp-card h3 {
  margin: 0 0 0.5rem;
}

.mp-card p {
  margin: 0 0 1rem;
  color: #4b5563;
  font-size: 14px;
}

.mp-tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.mp-tile {
  padding: 0.75rem;
  border-radius: 8px;
  background: #eef2ff;
  font-size: 12px;
  color: #4338ca;
}

.mp-tile strong {
  font-size: 18px;
  color: #1e1b4b;
}
</style>
