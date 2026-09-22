<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";
import { useDriverPosition } from "../composables/useDriverPosition";
import { bringInView, getFocusableElements } from "../core/utils";
import type { PopoverDOM, PopoverRenderModel, StageRect } from "../types";
import type { PopoverSlotProps } from "./types";

/**
 * The default popover: the same DOM, classes and accessibility contract as
 * driver.js, positioned with Floating UI. Every part is a slot, the whole body
 * can be replaced through the default slot or a custom component
 * (`popover.component`), and the arrow keeps pointing at the target either way.
 */
const props = withDefaults(
  defineProps<{
    /** The resolved popover model from the driver (or hints) state. */
    model: PopoverRenderModel;
    /** The element (or rect) the popover points at; ignored when the model is centered. */
    anchor?: Element | StageRect;
    /** Extra props merged into every slot's scope (the tour context). */
    scope?: Record<string, unknown>;
    zIndex?: number;
    /** Bump to re-position. */
    refreshTick?: number;
    /** Hint popovers render a single dismiss button and no close/progress. */
    mode?: "tour" | "hint";
    /** Positioning strategy; `absolute` scrolls natively with the page. */
    strategy?: "fixed" | "absolute";
  }>(),
  {
    anchor: undefined,
    scope: () => ({}),
    zIndex: 10000,
    refreshTick: 0,
    mode: "tour",
    strategy: "fixed",
  }
);

const emit = defineEmits<{
  /** The popover is in the DOM; carries the parts for `onPopoverRender`. */
  render: [dom: PopoverDOM];
  /** The popover left the DOM. */
  unrender: [dom: PopoverDOM];
}>();

defineSlots<{
  /** Replaces the whole body (close button, title, description, footer). */
  default?: (props: PopoverSlotProps) => any;
  arrow?: (props: PopoverSlotProps) => any;
  close?: (props: PopoverSlotProps) => any;
  title?: (props: PopoverSlotProps) => any;
  description?: (props: PopoverSlotProps) => any;
  footer?: (props: PopoverSlotProps) => any;
  progress?: (props: PopoverSlotProps) => any;
  prev?: (props: PopoverSlotProps) => any;
  next?: (props: PopoverSlotProps) => any;
}>();

const wrapper = useTemplateRef<HTMLElement>("wrapper");
const arrowEl = useTemplateRef<HTMLElement>("arrowEl");

const { floatingStyles, arrowStyles, side, arrowSide, align, update, isPositioned } = useDriverPosition({
  reference: () => props.anchor,
  floating: wrapper,
  arrow: arrowEl,
  side: () => props.model.side,
  align: () => props.model.align,
  offset: () => props.model.offset,
  padding: () => props.model.padding,
  centered: () => props.model.centered,
  strategy: props.strategy,
});

const showClose = computed(() => props.mode === "tour" && props.model.showButtons.includes("close"));
const showNext = computed(() => props.model.showButtons.includes("next"));
const showPrev = computed(() => props.mode === "tour" && props.model.showButtons.includes("previous"));
const showProgress = computed(() => props.mode === "tour" && props.model.showProgress);
const showFooter = computed(() => showNext.value || showPrev.value || showProgress.value);

const disabled = (button: "next" | "previous" | "close") => props.model.disableButtons.includes(button);

const wrapperClass = computed(() => [
  "driver-popover",
  props.mode === "hint" ? "driver-hint-popover" : "",
  props.model.popoverClass,
  `driver-popover-side-${side.value}`,
  `driver-popover-align-${align.value}`,
]);

const wrapperStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: props.zIndex + 2,
}));

const arrowClass = computed(() => [
  "driver-popover-arrow",
  arrowSide.value === "over" ? "driver-popover-arrow-none" : `driver-popover-arrow-side-${arrowSide.value}`,
]);

const slotProps = computed<PopoverSlotProps & Record<string, unknown>>(() => ({
  ...props.scope,
  popover: props.model,
  side: side.value,
  arrowSide: arrowSide.value,
  align: align.value,
  arrowStyles: arrowStyles.value,
  next: props.model.onNextClick,
  prev: props.model.onPrevClick,
  close: props.model.onCloseClick,
}));

const componentProps = computed(() => ({
  ...slotProps.value,
  ...(props.model.componentProps || {}),
}));

// Our own buttons never leak their clicks to the page: the app's listeners
// don't see them and the document click that advances on the active element
// is not confused by them. Links in the title/description are left alone.
const handle = (action: () => void) => (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  action();
};

const collectDom = (): PopoverDOM | undefined => {
  const root = wrapper.value;
  if (!root) {
    return undefined;
  }

  const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);

  return {
    wrapper: root,
    arrow: q(".driver-popover-arrow"),
    title: q(".driver-popover-title"),
    description: q(".driver-popover-description"),
    footer: q(".driver-popover-footer"),
    progress: q(".driver-popover-progress-text"),
    previousButton: q<HTMLButtonElement>(".driver-popover-prev-btn"),
    nextButton: q<HTMLButtonElement>(".driver-popover-next-btn"),
    closeButton: q<HTMLButtonElement>(".driver-popover-close-btn"),
    footerButtons: q(".driver-popover-navigation-btns"),
  };
};

let reported: PopoverDOM | undefined;

const focusFirst = () => {
  const root = wrapper.value;
  if (!root) {
    return;
  }

  // Focus on the first focusable element in the popover or the anchor. The
  // anchor is always scanned: a 0x0 anchor (like the tour's dummy element for
  // anchor-less popovers) never yields a focusable element anyway.
  const anchor = props.anchor instanceof Element ? [props.anchor] : [];
  const focusable = getFocusableElements([root, ...anchor]);
  // preventScroll: the element (tour) or the beacon (hint) is already in
  // view; focusing must not scroll the page on its own.
  focusable[0]?.focus({ preventScroll: true });
};

const repositionOnImagesLoad = () => {
  wrapper.value?.querySelectorAll("img").forEach(image => {
    if (image.complete) {
      return;
    }

    image.addEventListener("load", update, { once: true });
    image.addEventListener("error", update, { once: true });
  });
};

onMounted(() => {
  reported = collectDom();
  if (reported) {
    emit("render", reported);
  }

  repositionOnImagesLoad();
  focusFirst();
});

onBeforeUnmount(() => {
  if (reported) {
    emit("unrender", reported);
    reported = undefined;
  }
});

// Once positioned, scroll the popover into view if it landed off-screen.
watch(isPositioned, async positioned => {
  if (!positioned || !wrapper.value) {
    return;
  }

  await nextTick();
  // A hint's popover hangs off a beacon the user just clicked; the page must
  // not move under them. A tour step may need the popover scrolled into view.
  if (props.mode === "tour") {
    bringInView(wrapper.value, props.model.smoothScroll);
  }
});

watch(
  () => props.refreshTick,
  () => update()
);

defineExpose({
  /** Re-measure and re-position the popover. */
  update,
  /** The popover parts, for imperative access. */
  getDom: collectDom,
});
</script>

<!-- eslint-disable vue/no-v-html -- title, description and button texts are HTML for driver.js parity -->
<template>
  <Transition name="driver-popover" appear>
    <div
      id="driver-popover-content"
      ref="wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
      role="dialog"
      aria-labelledby="driver-popover-title"
      aria-describedby="driver-popover-description"
      :data-side="side"
      :data-align="align"
    >
      <slot v-if="model.showArrow" name="arrow" v-bind="slotProps">
        <div ref="arrowEl" :class="arrowClass" :style="arrowStyles" />
      </slot>

      <slot v-bind="slotProps">
        <component :is="model.component" v-if="model.component" v-bind="componentProps" />

        <template v-else>
          <slot v-if="showClose" name="close" v-bind="slotProps">
            <button
              type="button"
              class="driver-popover-close-btn"
              :class="{ 'driver-popover-btn-disabled': disabled('close') }"
              :disabled="disabled('close')"
              aria-label="Close"
              @click="handle(model.onCloseClick)($event)"
            >
              &times;
            </button>
          </slot>

          <slot v-if="model.title" name="title" v-bind="slotProps">
            <header id="driver-popover-title" class="driver-popover-title" v-html="model.title" />
          </slot>

          <slot v-if="model.description" name="description" v-bind="slotProps">
            <div id="driver-popover-description" class="driver-popover-description" v-html="model.description" />
          </slot>

          <slot v-if="showFooter" name="footer" v-bind="slotProps">
            <footer class="driver-popover-footer">
              <slot v-if="showProgress" name="progress" v-bind="slotProps">
                <span class="driver-popover-progress-text">{{ model.progressText }}</span>
              </slot>
              <span v-else class="driver-popover-progress-placeholder" />

              <span class="driver-popover-navigation-btns">
                <slot v-if="showPrev" name="prev" v-bind="slotProps">
                  <button
                    type="button"
                    class="driver-popover-prev-btn driver-popover-footer-btn"
                    :class="{ 'driver-popover-btn-disabled': disabled('previous') }"
                    :disabled="disabled('previous')"
                    @click="handle(model.onPrevClick)($event)"
                    v-html="model.prevBtnText"
                  />
                </slot>

                <slot v-if="showNext" name="next" v-bind="slotProps">
                  <button
                    type="button"
                    class="driver-popover-next-btn driver-popover-footer-btn"
                    :class="{
                      'driver-popover-btn-disabled': disabled('next'),
                      'driver-popover-done-btn': model.doneButton,
                    }"
                    :disabled="disabled('next')"
                    @click="handle(model.onNextClick)($event)"
                    v-html="model.nextBtnText"
                  />
                </slot>
              </span>
            </footer>
          </slot>
        </template>
      </slot>
    </div>
  </Transition>
</template>
