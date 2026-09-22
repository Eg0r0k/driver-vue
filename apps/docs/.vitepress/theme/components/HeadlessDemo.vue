<script setup lang="ts">
import { computed, ref } from "vue";
import { useDriver, useDriverPosition } from "driver-vue";

/**
 * No <DriverTour :driver="driver"> at all. The engine still runs the tour (state, hooks,
 * keyboard, scrolling, the body classes), and this component renders its
 * own overlay and card from `driver.state`, positioning the card with
 * `useDriverPosition`.
 */
const { drive, isActive, activeElement, popover, stage, activeIndex, driver } = useDriver({
  stagePadding: 6,
  steps: [
    { element: "#hl-title", popover: { title: "Headless", description: "This card is rendered by the demo itself." } },
    {
      element: "#hl-summary",
      popover: { title: "Your markup", description: "Any element, any framework component.", side: "top" },
    },
    {
      element: "#hl-share",
      popover: { title: "Your positioning", description: "useDriverPosition wraps Floating UI.", side: "right" },
    },
  ],
});

const card = ref<HTMLElement | null>(null);
const arrow = ref<HTMLElement | null>(null);

const { floatingStyles, arrowStyles, side } = useDriverPosition({
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
</script>

<template>
  <div class="demo">
    <DemoBox prefix="hl">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run headless</button>
      </template>
    </DemoBox>

    <Teleport to="body">
      <!-- A box-shadow overlay: the cutout is a fixed div with a huge shadow.
           A box-shadow cannot catch clicks, so the click layer is a separate
           full-screen div under it. Both it and the card carry
           `driver-interactive`, or the tour's page-wide
           `pointer-events: none` would swallow every click. -->
      <template v-if="isActive && stage">
        <div class="hl-click-layer driver-interactive" @click="driver.destroy()" />
        <div class="hl-cutout" :style="cutout" />
      </template>
      <div
        v-if="isActive && popover"
        ref="card"
        class="hl-card driver-interactive"
        :style="floatingStyles"
        :data-side="side"
      >
        <div ref="arrow" class="hl-arrow" :style="arrowStyles" />
        <span class="hl-step">Step {{ (activeIndex ?? 0) + 1 }} of {{ total }}</span>
        <strong>{{ popover.title }}</strong>
        <p>{{ popover.description }}</p>
        <div class="demo-row">
          <button type="button" class="demo-button secondary" @click="popover.onCloseClick()">Close</button>
          <button type="button" class="demo-button" @click="popover.onNextClick()">Next</button>
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
  box-shadow: 0 0 0 100vmax rgba(20, 20, 40, 0.7);
  z-index: var(--driver-z-index, 10000);
  pointer-events: none;
}

.hl-card {
  z-index: calc(var(--driver-z-index, 10000) + 2);
  width: 280px;
  background: #fff;
  color: #18181b;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.hl-card strong {
  display: block;
  font-size: 16px;
}

.hl-card p {
  margin: 4px 0 12px;
  font-size: 13px;
  color: #52525b;
}

.hl-step {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-brand-1);
}

.hl-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  transform: rotate(45deg);
}

.hl-card[data-side="bottom"] .hl-arrow {
  top: -6px;
}
.hl-card[data-side="top"] .hl-arrow {
  bottom: -6px;
}
.hl-card[data-side="right"] .hl-arrow {
  left: -6px;
}
.hl-card[data-side="left"] .hl-arrow {
  right: -6px;
}
</style>
