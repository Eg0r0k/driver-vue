<script setup lang="ts">
import { computed, onMounted, ref, useSlots } from "vue";
import DriverOverlay from "./DriverOverlay.vue";
import DriverPopover from "./DriverPopover.vue";
import DriverStage from "./DriverStage.vue";
import { injectDriver } from "../plugin";
import { isDummyElement } from "../core/utils";
import type { Driver, PopoverDOM } from "../types";
import type { OverlaySlotProps, StageSlotProps, TourScope, TourSlotProps } from "./types";

/**
 * Renders a driver's tour: the overlay, the stage and the popover, teleported
 * to `body` (or `config.teleportTo`) while the tour is active. Place it once
 * in your layout; pass the driver as a prop or install `DriverPlugin` and
 * omit it to render the shared instance.
 */
const props = defineProps<{
  driver?: Driver;
}>();

defineSlots<{
  /** Replaces the overlay. */
  overlay?: (props: OverlaySlotProps) => any;
  /** Decorates the stage (rendered inside `.driver-stage`). */
  stage?: (props: StageSlotProps) => any;
  /** Replaces the popover body; the positioned wrapper and the arrow remain. */
  popover?: (props: TourSlotProps) => any;
  arrow?: (props: TourSlotProps) => any;
  close?: (props: TourSlotProps) => any;
  title?: (props: TourSlotProps) => any;
  description?: (props: TourSlotProps) => any;
  footer?: (props: TourSlotProps) => any;
  progress?: (props: TourSlotProps) => any;
  prev?: (props: TourSlotProps) => any;
  next?: (props: TourSlotProps) => any;
}>();

const injected = injectDriver({ optional: true });
const driver = computed(() => props.driver ?? injected?.value);

if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production" && !driver.value) {
  console.warn("[driver-vue] <DriverTour> has no driver: pass the `driver` prop or install DriverPlugin.");
}

// Nothing renders on the server or before hydration; the tour is client-only.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const state = computed(() => driver.value?.state);

// Config is not reactive; it is read again whenever the tour (re)activates.
const config = computed(() => {
  void state.value?.isActive;
  return driver.value?.getConfig() ?? {};
});

const teleportTo = computed(() => config.value.teleportTo ?? "body");
const zIndex = computed(() => config.value.zIndex ?? 10000);
const padding = computed(() => config.value.stagePadding ?? 0);
const radius = computed(() => config.value.stageRadius ?? 0);

const OverlayComponent = computed(() => config.value.components?.overlay ?? DriverOverlay);

const scope = computed<TourScope | undefined>(() => {
  const d = driver.value;
  const s = state.value;
  if (!d || !s || !s.activeStep) {
    return undefined;
  }

  const total = d.getConfig("steps")?.length ?? 0;

  return {
    driver: d,
    step: s.activeStep,
    index: s.activeIndex ?? -1,
    total,
    element: isDummyElement(s.activeElement) ? undefined : s.activeElement,
    isFirst: d.isFirstStep(),
    isLast: d.isLastStep(),
    hasNext: d.hasNextStep(),
    hasPrev: d.hasPreviousStep(),
  };
});

const overlayScope = computed<OverlaySlotProps | undefined>(() => {
  const s = state.value;
  if (!scope.value || !s?.stage) {
    return undefined;
  }

  return {
    ...scope.value,
    stage: s.stage,
    padding: padding.value,
    radius: radius.value,
    color: config.value.overlayColor ?? "#000",
    opacity: config.value.overlayOpacity ?? 0.7,
    zIndex: zIndex.value,
    transitioning: s.transitioning,
    animated: config.value.animate !== false,
    refreshTick: s.refreshTick,
    onClick: () => driver.value?.__internal.overlayClick(),
  };
});

const stageScope = computed<StageSlotProps | undefined>(() => {
  const s = state.value;
  if (!scope.value || !s?.stage) {
    return undefined;
  }

  return {
    ...scope.value,
    stage: s.stage,
    padding: padding.value,
    radius: radius.value,
    transitioning: s.transitioning,
  };
});

const popoverAnchor = computed(() => state.value?.activeElement);

const onPopoverRender = (dom: PopoverDOM) => {
  driver.value?.__internal.reportPopoverDom(dom);
};

const onPopoverUnrender = (dom: PopoverDOM) => {
  // Only clear what is still the reported popover; a newer one may already be up.
  if (driver.value?.getState("popover") === dom) {
    driver.value.__internal.clearPopoverDom();
  }
};

// Popover part slots that were actually provided are forwarded to the
// popover; the rest keep the popover's default content. `popover` is
// forwarded separately as the popover's default slot.
const slots = useSlots();
const popoverSlots = ["arrow", "close", "title", "description", "footer", "progress", "prev", "next"] as const;
const forwardedSlots = computed(() => popoverSlots.filter(name => !!slots[name]));
</script>

<template>
  <Teleport v-if="mounted && state?.isActive" :to="teleportTo">
    <Transition name="driver-overlay" appear>
      <template v-if="overlayScope">
        <slot name="overlay" v-bind="overlayScope">
          <component
            :is="OverlayComponent"
            :stage="overlayScope.stage"
            :padding="overlayScope.padding"
            :radius="overlayScope.radius"
            :color="overlayScope.color"
            :opacity="overlayScope.opacity"
            :z-index="overlayScope.zIndex"
            :transitioning="overlayScope.transitioning"
            :animated="overlayScope.animated"
            :refresh-tick="overlayScope.refreshTick"
            :class="config.overlayClass"
            @click="overlayScope.onClick"
          />
        </slot>
      </template>
    </Transition>

    <DriverStage
      v-if="stageScope"
      :stage="stageScope.stage"
      :padding="stageScope.padding"
      :radius="stageScope.radius"
      :transitioning="stageScope.transitioning"
      :z-index="zIndex"
      :class="config.stageClass"
    >
      <slot name="stage" v-bind="stageScope" />
    </DriverStage>

    <DriverPopover
      v-if="state?.popover && scope"
      :key="state.popover.key"
      :model="state.popover"
      :anchor="popoverAnchor"
      :scope="scope"
      :z-index="zIndex"
      :refresh-tick="state.refreshTick"
      @render="onPopoverRender"
      @unrender="onPopoverUnrender"
    >
      <template v-if="$slots.popover" #default="slotProps">
        <slot name="popover" v-bind="slotProps as TourSlotProps" />
      </template>

      <template v-for="name in forwardedSlots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps as TourSlotProps" />
      </template>
    </DriverPopover>
  </Teleport>
</template>
