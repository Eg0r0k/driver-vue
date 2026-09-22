<script setup lang="ts">
useHead({ title: "Multi-page tour (2/2) · driver-vue playground" });

/** The second half of the multi-page tour; see one.vue for the mechanics. */
const progress = useState<{ page: "one" | "two"; index: number } | null>("multi-page-step", () => null);
const { log } = useExampleRunner();

const { drive } = useDriver(
  {
    showProgress: true,
    progressText: "Page 2 · {{current}} of {{total}}",
    steps: [
      {
        element: "#mp-settings",
        popover: {
          title: "Page two",
          description: "The tour resumed here right after navigation; the previous button goes back a page.",
          side: "bottom",
          align: "start",
          prevBtnText: "← Previous page",
          onPrevClick: () => {
            progress.value = { page: "one", index: 1 };
            navigateTo("/multi-page/one");
          },
        },
      },
      {
        element: "#mp-save",
        popover: {
          title: "Settings",
          description: "Any element on this page is fair game, exactly like a single-page tour.",
          side: "left",
          align: "start",
        },
      },
      {
        popover: {
          title: "Done",
          description: "A centered closing step. Finishing clears the stored position.",
        },
      },
    ],
    onDestroyed: () => {
      if (progress.value?.page === "two") {
        progress.value = null;
        log("multi-page: tour finished on page two");
      }
    },
  },
  { shared: true }
);

onMounted(() => {
  if (progress.value?.page === "two") {
    drive(progress.value.index);
  }
});

const start = () => {
  progress.value = { page: "two", index: 0 };
  drive(0);
};
</script>

<template>
  <div class="page">
    <section class="fx-controls">
      <h2>Multi-page tour, page two</h2>
      <p class="fx-hint">
        If you arrived through the tour it continued automatically. You can also start this half on its own.
      </p>
      <div class="fx-row">
        <button type="button" class="demo-button" @click="start">Start from here</button>
        <NuxtLink to="/multi-page/one" class="mp-link">← Back to page one</NuxtLink>
      </div>
    </section>

    <section id="mp-settings" class="mp-card">
      <h3>Settings</h3>
      <p>Page two of the imaginary app.</p>
      <label class="mp-field">
        Workspace name
        <input type="text" value="Acme Inc." readonly />
      </label>
      <label class="mp-field">
        Time zone
        <input type="text" value="UTC" readonly />
      </label>
      <button id="mp-save" type="button" class="demo-button">Save changes</button>
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
  display: grid;
  gap: 0.75rem;
  max-width: 420px;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.mp-card h3,
.mp-card p {
  margin: 0;
}

.mp-card p {
  color: #4b5563;
  font-size: 14px;
}

.mp-field {
  display: grid;
  gap: 0.25rem;
  font-size: 13px;
}

.mp-field input {
  padding: 0.45rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font: inherit;
}

.mp-card .demo-button {
  justify-self: start;
}
</style>
