<script setup lang="ts">
import { computed, ref } from "vue";
import { useDriver, useDriverPosition } from "driver-vue";

/**
 * No <DriverTour> at all. The engine still runs the tour (state, hooks,
 * keyboard, scrolling, the body classes), and this component renders its own
 * overlay and card from the driver's state, positioning the card with
 * `useDriverPosition`.
 */
const { drive, isActive, activeElement, popover, stage, activeIndex, driver } = useDriver({
  stagePadding: 6,
  steps: [
    { element: "#hl-title", popover: { title: "Headless", description: "This card is rendered by the demo itself." } },
    {
      element: "#hl-summary",
      popover: { title: "Your markup", description: "The card reads the popover from the driver state.", side: "top" },
    },
    {
      element: "#hl-share",
      popover: {
        title: "Your positioning",
        description: "useDriverPosition places the card and the arrow.",
        side: "right",
      },
    },
  ],
});

const card = ref<HTMLElement | null>(null);
const arrow = ref<HTMLElement | null>(null);

const { floatingStyles, arrowStyles, arrowSide, referenceHidden } = useDriverPosition({
  reference: activeElement,
  floating: card,
  arrow,
  side: () => popover.value?.side ?? "bottom",
  align: () => popover.value?.align ?? "start",
  offset: () => popover.value?.offset ?? 10,
  padding: () => popover.value?.padding ?? 0,
  centered: () => popover.value?.centered ?? false,
  open: () => !!popover.value,
});

const total = computed(() => driver.getConfig("steps")?.length ?? 0);

const cutout = computed(() => {
  const s = stage.value;
  if (!s) return {};
  const p = 6;
  return {
    left: `${s.x - p}px`,
    top: `${s.y - p}px`,
    width: `${s.width + p * 2}px`,
    height: `${s.height + p * 2}px`,
  };
});

const scrollBack = () => activeElement.value?.scrollIntoView({ block: "center", behavior: "smooth" });
</script>

<template>
  <div class="demo">
    <DemoBox prefix="hl">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run headless</button>
      </template>
    </DemoBox>

    <Teleport to="body">
      <template v-if="isActive && stage">
        <div class="hl-click-layer driver-interactive" @click="driver.destroy()" />
        <div class="hl-cutout" :style="cutout" />
      </template>
      <div
        v-if="isActive && popover"
        ref="card"
        class="hl-card driver-interactive"
        :style="floatingStyles"
        :data-arrow-side="arrowSide"
      >
        <div v-show="arrowSide !== 'over'" ref="arrow" class="hl-arrow" :style="arrowStyles" />
        <span class="hl-step">Step {{ (activeIndex ?? 0) + 1 }} of {{ total }}</span>
        <strong>{{ popover.title }}</strong>
        <p>{{ popover.description }}</p>
        <div class="demo-row">
          <button type="button" class="demo-button" @click="popover.onCloseClick()">Close</button>
          <button v-if="referenceHidden" type="button" class="demo-button" @click="scrollBack">Scroll back</button>
          <button type="button" class="demo-run" @click="popover.onNextClick()">
            {{ popover.doneButton ? "Done" : "Next" }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.hl-click-layer {
  position: fixed;
  inset: 0;
  z-index: calc(var(--driver-z-index, 10000) - 1);
}

.hl-cutout {
  position: fixed;
  border-radius: 8px;
  box-shadow: 0 0 0 200vmax rgba(0, 0, 0, 0.6);
  z-index: var(--driver-z-index, 10000);
  pointer-events: none;
}

.hl-card {
  z-index: calc(var(--driver-z-index, 10000) + 2);
  box-sizing: border-box;
  width: 280px;
  padding: 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-3);
  font-family: var(--vp-font-family-base);
}

.hl-card strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
}

.hl-card p {
  margin: 4px 0 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.hl-step {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* A 12px box; the visible square is a rotated pseudo-element, so the
   measured arrow size stays 12px. */
.hl-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
}

.hl-arrow::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--vp-c-bg-elv);
  transform: rotate(45deg);
}

.hl-card[data-arrow-side="bottom"] .hl-arrow {
  top: -6px;
}
.hl-card[data-arrow-side="top"] .hl-arrow {
  bottom: -6px;
}
.hl-card[data-arrow-side="right"] .hl-arrow {
  left: -6px;
}
.hl-card[data-arrow-side="left"] .hl-arrow {
  right: -6px;
}
</style>
