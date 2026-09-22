<script setup lang="ts">
import { computed, onMounted, ref, useSlots } from "vue";
import DriverHintBeacon from "./DriverHintBeacon.vue";
import DriverPopover from "./DriverPopover.vue";
import { generateStageSvgPathString, getViewport } from "../core/stage";
import { HINT_OVERLAY_PADDING, HINT_OVERLAY_RADIUS, type Hints, type MountedHint } from "../core/hints";
import type { PopoverDOM } from "../types";
import type { PopoverSlotProps } from "./types";

/**
 * Renders a hints instance: every beacon, the optional overlay and the open
 * hint's popover, teleported to `body` while the hints are shown.
 */
const props = defineProps<{
  hints: Hints;
}>();

/** What the hint slots receive on top of the popover slot props. */
export type HintScope = {
  hints: Hints;
  hint: MountedHint["hint"];
  id: string;
  element: Element;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  dismiss: () => void;
  close: () => void;
};

export type HintSlotProps = HintScope & PopoverSlotProps;

defineSlots<{
  /** Content of a beacon button (the button itself stays, positioned and labelled). */
  beacon?: (props: HintScope & { entry: MountedHint }) => any;
  /** Replaces the popover body. */
  popover?: (props: HintSlotProps) => any;
  arrow?: (props: HintSlotProps) => any;
  title?: (props: HintSlotProps) => any;
  description?: (props: HintSlotProps) => any;
  footer?: (props: HintSlotProps) => any;
  next?: (props: HintSlotProps) => any;
}>();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const state = computed(() => props.hints.state);
const config = computed(() => {
  void state.value.isVisible;
  return props.hints.getConfig();
});

const teleportTo = computed(() => config.value.teleportTo ?? "body");
const zIndex = computed(() => config.value.zIndex ?? 10000);

const viewport = computed(() => {
  void state.value.refreshTick;
  return getViewport();
});

const overlayViewBox = computed(() => `0 0 ${viewport.value.width} ${viewport.value.height}`);

const overlayPath = computed(() => {
  const rect = state.value.overlayRect;
  if (!rect) {
    return "";
  }

  return generateStageSvgPathString(
    rect,
    { padding: HINT_OVERLAY_PADDING, radius: HINT_OVERLAY_RADIUS },
    viewport.value
  );
});

const overlayPathStyle = computed(() => ({
  fill: config.value.overlayColor || "#000",
  opacity: config.value.overlayOpacity ?? 0.7,
  pointerEvents: "auto" as const,
}));

// In overlay mode the spotlight does the pointing, so the beacon steps aside
// while its popover is up and the popover frames the element.
const visibleBeacons = computed(() =>
  state.value.mounted.filter(entry => !(config.value.overlay && entry.expanded))
);

function scopeFor(entry: MountedHint): HintScope {
  return {
    hints: props.hints,
    hint: entry.hint,
    id: entry.id,
    element: entry.element,
    isOpen: entry.expanded,
    open: () => props.hints.open(entry.id),
    toggle: () => props.hints.toggle(entry.id),
    dismiss: () => props.hints.dismiss(entry.id),
    close: () => props.hints.close(),
  };
}

const activeEntry = computed(() =>
  state.value.activeId ? state.value.mounted.find(entry => entry.id === state.value.activeId) : undefined
);

const popoverScope = computed(() => (activeEntry.value ? scopeFor(activeEntry.value) : undefined));

function onPopoverRender(dom: PopoverDOM) {
  props.hints.__internal.reportPopoverDom(dom);
}

function onPopoverUnrender(dom: PopoverDOM) {
  props.hints.__internal.clearPopoverDom(dom);
}

const slots = useSlots();
const popoverSlots = ["arrow", "title", "description", "footer", "next"] as const;
const forwardedSlots = computed(() => popoverSlots.filter(name => !!slots[name]));
</script>

<template>
  <Teleport v-if="mounted && state.isVisible" :to="teleportTo">
    <DriverHintBeacon
      v-for="entry in visibleBeacons"
      :key="entry.id"
      :entry="entry"
      @click="hints.toggle(entry.id)"
      @mounted="hints.__internal.registerBeacon"
      @unmounted="hints.__internal.unregisterBeacon"
    >
      <slot v-if="$slots.beacon" name="beacon" v-bind="{ ...scopeFor(entry), entry }" />
    </DriverHintBeacon>

    <Transition name="driver-hint-overlay" appear>
      <svg
        v-if="state.overlayRect"
        class="driver-hint-overlay"
        :viewBox="overlayViewBox"
        preserveAspectRatio="xMinYMin slice"
        :style="{ zIndex: zIndex - 3 }"
      >
        <path class="driver-hint-overlay-path" :d="overlayPath" :style="overlayPathStyle" />
      </svg>
    </Transition>

    <DriverPopover
      v-if="state.popover && popoverScope"
      :key="state.popover.key"
      mode="hint"
      :model="state.popover"
      :anchor="state.popoverAnchor"
      :scope="popoverScope"
      :z-index="zIndex"
      :refresh-tick="state.refreshTick"
      @render="onPopoverRender"
      @unrender="onPopoverUnrender"
    >
      <template v-if="$slots.popover" #default="slotProps">
        <slot name="popover" v-bind="slotProps as HintSlotProps" />
      </template>

      <template v-for="name in forwardedSlots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps as HintSlotProps" />
      </template>
    </DriverPopover>
  </Teleport>
</template>
