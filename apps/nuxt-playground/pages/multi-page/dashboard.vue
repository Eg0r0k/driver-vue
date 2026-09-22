<script setup lang="ts">
useHead({ title: "Dashboard · driver-vue playground" });

/**
 * The first screen of the mock app the multi-page tour walks through. The
 * tour itself lives in `useMultiPageTour()` (called by the layout) and its
 * steps in `examples/multi-page.ts`; pages only provide the elements.
 */
const stats = [
  { id: "mp-stat-revenue", label: "Revenue", value: "$12,480", delta: "+8.2% vs last month" },
  { id: "mp-stat-users", label: "Active users", value: "1,208", delta: "+124 this week" },
  { id: "mp-stat-churn", label: "Churn", value: "2.1%", delta: "−0.4pt" },
];

const activity = [
  "Invoice #2481 paid by Northwind",
  "3 seats added to the Growth plan",
  "Weekly report exported by Dana",
];
</script>

<template>
  <div class="page">
    <MultiPageNav />

    <section class="mp-screen">
      <header id="mp-dashboard-title" class="mp-head">
        <h2>Dashboard</h2>
        <p>Acme Inc. · last 30 days</p>
      </header>

      <div class="mp-stats">
        <article v-for="stat in stats" :id="stat.id" :key="stat.id" class="mp-stat">
          <span class="mp-stat-label">{{ stat.label }}</span>
          <strong class="mp-stat-value">{{ stat.value }}</strong>
          <span class="mp-stat-delta">{{ stat.delta }}</span>
        </article>
      </div>

      <h3 class="mp-subhead">Recent activity</h3>
      <ul class="mp-list">
        <li v-for="item in activity" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="fx-controls">
      <h2>How the tour crosses pages</h2>
      <p class="fx-hint">
        A tour is not tied to a route. Keep the index in shared state, let a step's <code>onNextClick</code> destroy the
        driver and navigate, then call <code>drive(index)</code> once the next route is rendered. The state is mirrored
        to <code>localStorage</code>, so a reload in the middle of the tour resumes it.
      </p>
      <pre class="fx-code">
// composables/useMultiPageTour.ts
onNextClick: () =&gt; {
  if (next.page === route.path) return driver.moveNext();

  state.value = { ...state.value, index: index + 1, navigating: true };
  driver.destroy();
  navigateTo(next.page);
}

watch(() =&gt; route.path, () =&gt; resume()); // drive(index) on the new page</pre>
    </section>
  </div>
</template>
