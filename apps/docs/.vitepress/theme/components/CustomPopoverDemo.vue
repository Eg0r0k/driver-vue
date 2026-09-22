<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The whole popover body comes from the `#popover` slot: a progress bar, an
 * emoji "avatar", and buttons from the docs' own button styles. The
 * positioned wrapper and the arrow are still driver-vue's.
 */
const { drive, driver } = useDriver({
  showProgress: true,
  popoverClass: "docs-custom-popover",
  steps: [
    { element: "#custom-title", popover: { title: "Your report", description: "Everything starts here." } },
    { element: "#custom-search", popover: { title: "Search", description: "Find any metric by name.", side: "top" } },
    { element: "#custom-export", popover: { title: "Export", description: "CSV or PDF, one click.", side: "right" } },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="custom" />
    <button type="button" class="demo-run" @click="drive()">Run with a custom popover</button>

    <ClientOnly>
      <DriverTour :driver="driver">
        <template #popover="{ popover, index, total, isFirst, isLast, next, prev, close }">
          <div class="cp">
            <div class="cp-head">
              <span class="cp-avatar">🧭</span>
              <div>
                <strong class="cp-title" v-text="popover.title" />
                <p class="cp-desc" v-text="popover.description" />
              </div>
              <button type="button" class="cp-close" aria-label="Close" @click="close">✕</button>
            </div>
            <div class="cp-bar"><span :style="{ width: `${((index + 1) / total) * 100}%` }" /></div>
            <div class="cp-actions">
              <span class="cp-count">{{ index + 1 }} / {{ total }}</span>
              <button type="button" class="demo-button secondary" :disabled="isFirst" @click="prev">Back</button>
              <button type="button" class="demo-button" @click="next">{{ isLast ? "Finish" : "Continue" }}</button>
            </div>
          </div>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.driver-popover.docs-custom-popover {
  --driver-popover-padding: 0;
  --driver-popover-radius: 14px;
  --driver-popover-max-width: 340px;
  --driver-popover-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
}

.cp {
  padding: 16px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.cp-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cp-avatar {
  font-size: 28px;
  line-height: 1;
}

.cp-title {
  display: block;
  font-size: 16px;
}

.cp-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #52525b;
}

.cp-close {
  margin-left: auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #a1a1aa;
}

.cp-bar {
  height: 4px;
  border-radius: 2px;
  background: #e4e4e7;
  margin: 14px 0 10px;
  overflow: hidden;
}

.cp-bar span {
  display: block;
  height: 100%;
  background: #4f46e5;
  transition: width 300ms ease;
}

.cp-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cp-count {
  font-size: 12px;
  color: #71717a;
  margin-right: auto;
}

.cp-actions .demo-button[disabled] {
  opacity: 0.4;
  cursor: default;
}
</style>
