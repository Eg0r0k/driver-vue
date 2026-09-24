<script setup lang="ts">
import { defineComponent, h, type PropType } from "vue";
import { useDriver, DriverTour, type PopoverRenderModel } from "driver-vue";

/**
 * A popover body component set per step through `popover.component`. It gets
 * the slot props as props, plus `note` from `popover.props`.
 */
const NoteStep = defineComponent({
  // The slot props this component does not declare would otherwise land on its root element as attributes.
  inheritAttrs: false,
  props: {
    popover: { type: Object as PropType<PopoverRenderModel>, required: true },
    next: { type: Function as PropType<() => void>, required: true },
    close: { type: Function as PropType<() => void>, required: true },
    isLast: Boolean,
    note: { type: String, default: "" },
  },
  setup: props => () =>
    h("div", { class: "sc" }, [
      h("strong", { id: "driver-popover-title", class: "sc-title" }, props.popover.title),
      h("p", { id: "driver-popover-description", class: "sc-desc" }, props.popover.description),
      h("p", { class: "sc-note" }, props.note),
      h("div", { class: "demo-row" }, [
        h("button", { type: "button", class: "demo-button", onClick: () => props.close() }, "Skip"),
        h("button", { type: "button", class: "demo-run", onClick: () => props.next() }, props.isLast ? "Done" : "Next"),
      ]),
    ]),
});

const { drive, driver } = useDriver({
  popoverClass: "docs-step-popover",
  steps: [
    {
      element: "#stepc-title",
      popover: { title: "Default body", description: "This step has no component." },
    },
    {
      element: "#stepc-export",
      popover: {
        title: "Component body",
        description: "This body is the component set in popover.component.",
        component: NoteStep,
        props: { note: "This line is the note prop from popover.props." },
        side: "right",
      },
    },
    {
      element: "#stepc-share",
      popover: {
        title: "Same component",
        description: "The same component with a different note.",
        component: NoteStep,
        props: { note: "A second value for the same prop." },
        side: "top",
      },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="stepc">
      <template #footer>
        <button type="button" class="demo-run" @click="drive()">Run with per-step components</button>
      </template>
    </DemoBox>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>

<style>
.driver-popover.docs-step-popover {
  --driver-popover-bg: var(--vp-c-bg-elv);
  --driver-popover-color: var(--vp-c-text-1);
  --driver-popover-radius: 8px;
  --driver-popover-shadow: var(--vp-shadow-3);
  --driver-popover-font-family: var(--vp-font-family-base);
  --driver-popover-title-size: 15px;
  --driver-popover-progress-color: var(--vp-c-text-2);
  --driver-popover-close-color: var(--vp-c-text-3);
  --driver-popover-close-hover-color: var(--vp-c-text-1);
  --driver-popover-btn-bg: var(--vp-c-bg);
  --driver-popover-btn-hover-bg: var(--vp-c-bg-soft);
  --driver-popover-btn-color: var(--vp-c-text-1);
  --driver-popover-btn-border: 1px solid var(--vp-c-divider);
  --driver-popover-btn-radius: 6px;
}

.sc-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
}

.sc-desc {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
}

.sc-note {
  margin: 8px 0 12px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
