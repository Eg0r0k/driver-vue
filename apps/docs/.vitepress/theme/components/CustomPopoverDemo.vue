<script setup lang="ts">
import { useDriver, DriverTour } from "driver-vue";

/**
 * The whole popover body comes from the `#popover` slot: title, description,
 * a progress bar and the docs' own buttons. The positioned wrapper and the
 * arrow are still driver-vue's.
 */
const { drive, driver } = useDriver({
  popoverClass: "docs-custom-popover",
  steps: [
    { element: "#custom-title", popover: { title: "Title", description: "The body of this popover is a slot." } },
    {
      element: "#custom-search",
      popover: { title: "Field", description: "The progress bar uses index and total.", side: "top" },
    },
    {
      element: "#custom-export",
      popover: { title: "Button", description: "Back and Next call prev() and next().", side: "right" },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="custom">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with a custom popover</button>
      </template>
    </DemoBox>

    <ClientOnly>
      <DriverTour :driver="driver">
        <template #popover="{ popover, index, total, isFirst, isLast, next, prev, close }">
          <div class="cp">
            <div class="cp-head">
              <strong id="driver-popover-title" class="cp-title">{{ popover.title }}</strong>
              <button type="button" class="cp-close" aria-label="Close" @click="close">&times;</button>
            </div>
            <p id="driver-popover-description" class="cp-desc">{{ popover.description }}</p>
            <div class="cp-bar"><span :style="{ width: `${((index + 1) / total) * 100}%` }" /></div>
            <div class="cp-actions">
              <span class="cp-count">{{ index + 1 }} / {{ total }}</span>
              <button type="button" class="demo-button" :disabled="isFirst" @click="prev">Back</button>
              <button type="button" class="demo-run" @click="next">{{ isLast ? "Finish" : "Next" }}</button>
            </div>
          </div>
        </template>
      </DriverTour>
    </ClientOnly>
  </div>
</template>

<style>
.driver-popover.docs-custom-popover {
  --driver-popover-bg: var(--vp-c-bg-elv);
  --driver-popover-color: var(--vp-c-text-1);
  --driver-popover-padding: 16px;
  --driver-popover-radius: 8px;
  --driver-popover-max-width: 320px;
  --driver-popover-shadow: var(--vp-shadow-3);
  --driver-popover-font-family: var(--vp-font-family-base);
}

.cp-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cp-title {
  font-size: 15px;
  font-weight: 600;
}

.cp-desc {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.cp-close {
  margin-left: auto;
  border: 0;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.cp-close:hover {
  color: var(--vp-c-text-1);
}

.cp-bar {
  height: 4px;
  margin: 14px 0 12px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--vp-c-divider);
}

.cp-bar span {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 300ms ease;
}

.cp-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cp-count {
  margin-right: auto;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
