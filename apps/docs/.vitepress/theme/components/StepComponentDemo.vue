<script setup lang="ts">
import { defineComponent, h } from "vue";
import { useDriver, DriverTour, type TourSlotProps } from "driver-vue";

// A popover body as a Vue component. It receives the same props as the
// `#popover` slot (TourSlotProps) plus anything from `popover.props`.
const VideoStep = defineComponent({
  props: {
    popover: { type: Object, required: true },
    next: { type: Function, required: true },
    close: { type: Function, required: true },
    isLast: Boolean,
    // From `popover.props`:
    emoji: { type: String, default: "🎬" },
  },
  setup: props => () =>
    h("div", { class: "sc" }, [
      h("div", { class: "sc-media" }, props.emoji),
      h("strong", (props.popover as TourSlotProps["popover"]).title),
      h("p", (props.popover as TourSlotProps["popover"]).description),
      h("div", { class: "demo-row" }, [
        h("button", { type: "button", class: "demo-button secondary", onClick: () => props.close() }, "Skip"),
        h(
          "button",
          { type: "button", class: "demo-button", onClick: () => props.next() },
          props.isLast ? "Done" : "Next"
        ),
      ]),
    ]),
});

const { drive, driver } = useDriver({
  steps: [
    {
      element: "#stepc-title",
      popover: { title: "Default popover", description: "This step uses the built-in DriverPopover body." },
    },
    {
      element: "#stepc-export",
      popover: {
        title: "A component step",
        description: "This body is a Vue component passed as popover.component.",
        component: VideoStep,
        props: { emoji: "📦" },
        side: "right",
      },
    },
    {
      element: "#stepc-share",
      popover: {
        title: "Another one",
        description: "Same component, different props.",
        component: VideoStep,
        props: { emoji: "🚀" },
        side: "top",
      },
    },
  ],
});
</script>

<template>
  <div class="demo">
    <DemoBox prefix="stepc" />
    <button type="button" class="demo-run" @click="drive()">Run with per-step components</button>
    <ClientOnly>
      <DriverTour :driver="driver" />
    </ClientOnly>
  </div>
</template>

<style>
.sc strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.sc p {
  margin: 0 0 12px;
  font-size: 13px;
}

.sc-media {
  font-size: 40px;
  text-align: center;
  background: #eef2ff;
  border-radius: 8px;
  padding: 16px 0;
  margin-bottom: 12px;
}
</style>
