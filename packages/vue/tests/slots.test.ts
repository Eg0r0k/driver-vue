import { defineComponent, h, nextTick } from "vue";
import type { TourSlotProps, OverlaySlotProps, StageSlotProps } from "../src/components/types";
import { click, createDriver, flush, navButton, popoverEl, SAMPLE_STEPS, stageEl, useDriverHarness } from "./utils";

useDriverHarness();

describe("popover slots", () => {
  it("replaces the popover body with the popover slot and exposes the tour scope", async () => {
    let received: TourSlotProps | undefined;
    const d = createDriver(
      { animate: false, steps: SAMPLE_STEPS },
      {
        popover: (props: TourSlotProps) => {
          received = props;
          return h("div", { class: "my-body" }, [
            h("b", { class: "my-title" }, props.popover.title),
            h("button", { class: "my-next", onClick: props.next }, "go"),
          ]);
        },
      }
    );
    await d.drive();

    expect(popoverEl()?.querySelector(".my-body")).not.toBeNull();
    expect(popoverEl()?.querySelector(".my-title")?.textContent).toBe("Step 1");
    expect(document.querySelector(".driver-popover-title")).toBeNull();
    expect(navButton("next")).toBeNull();

    expect(received?.index).toBe(0);
    expect(received?.total).toBe(3);
    expect(received?.isFirst).toBe(true);
    expect(received?.isLast).toBe(false);
    expect(received?.hasNext).toBe(true);
    expect(received?.hasPrev).toBe(false);
    expect(received?.element).toBe(document.querySelector("#intro"));
    expect(received?.driver.getActiveIndex()).toBe(0);
    expect(received?.side).toBeDefined();

    await click(popoverEl()?.querySelector(".my-next"));
    expect(d.getActiveIndex()).toBe(1);
    expect(popoverEl()?.querySelector(".my-title")?.textContent).toBe("Step 2");
  });

  it("keeps the arrow when only the body is replaced", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS }, { popover: () => h("i", "x") });
    await d.drive();

    expect(popoverEl()?.querySelector(".driver-popover-arrow")).not.toBeNull();
  });

  it("replaces single parts with the part slots", async () => {
    const d = createDriver(
      { animate: false, steps: SAMPLE_STEPS, showProgress: true },
      {
        title: (props: TourSlotProps) => h("h2", { class: "my-h2" }, props.popover.title),
        progress: (props: TourSlotProps) => h("em", { class: "my-progress" }, `${props.index + 1}/${props.total}`),
        next: (props: TourSlotProps) => h("button", { class: "my-next-btn", onClick: props.next }, "Forward"),
      }
    );
    await d.drive();

    expect(popoverEl()?.querySelector(".my-h2")?.textContent).toBe("Step 1");
    expect(document.querySelector(".driver-popover-title")).toBeNull();
    expect(popoverEl()?.querySelector(".my-progress")?.textContent).toBe("1/3");
    expect(document.querySelector(".driver-popover-progress-text")).toBeNull();
    expect(navButton("next")).toBeNull();
    // Untouched parts keep their defaults.
    expect(document.querySelector(".driver-popover-description")?.textContent).toBe("First");
    expect(navButton("prev")).not.toBeNull();
    expect(navButton("close")).not.toBeNull();

    await click(popoverEl()?.querySelector(".my-next-btn"));
    expect(d.getActiveIndex()).toBe(1);
  });

  it("passes an element-less step as undefined element", async () => {
    let received: TourSlotProps | undefined;
    const d = createDriver(
      { animate: false, steps: [{ popover: { title: "Centered" } }] },
      {
        popover: (props: TourSlotProps) => {
          received = props;
          return h("i", "x");
        },
      }
    );
    await d.drive();

    expect(received?.element).toBeUndefined();
    expect(received?.popover.centered).toBe(true);
    expect(received?.side).toBe("over");
  });
});

describe("custom popover components", () => {
  const StepPopover = defineComponent({
    props: { popover: { type: Object, required: true }, next: Function, accent: String, index: Number },
    setup(props) {
      return () =>
        h("div", { class: "step-popover", "data-accent": props.accent }, [
          h("span", { class: "step-popover-title" }, (props.popover as any).title),
          h("button", { class: "step-popover-next", onClick: () => props.next?.() }, "next"),
        ]);
    },
  });

  it("renders a per-step component with the slot props and its own props", async () => {
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Custom", component: StepPopover, props: { accent: "red" } } },
        { element: "#card-1", popover: { title: "Plain" } },
      ],
    });
    await d.drive();

    const custom = popoverEl()?.querySelector<HTMLElement>(".step-popover");
    expect(custom).not.toBeNull();
    expect(custom?.dataset.accent).toBe("red");
    expect(custom?.querySelector(".step-popover-title")?.textContent).toBe("Custom");
    expect(document.querySelector(".driver-popover-title")).toBeNull();

    await click(custom?.querySelector(".step-popover-next"));

    // The next step has no component and renders the default body.
    expect(document.querySelector(".step-popover")).toBeNull();
    expect(document.querySelector(".driver-popover-title")?.textContent).toBe("Plain");
  });

  it("falls back to the global components.popover", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, components: { popover: StepPopover } });
    await d.drive();

    expect(popoverEl()?.querySelector(".step-popover-title")?.textContent).toBe("Step 1");
  });

  it("prefers the popover slot over the components", async () => {
    const d = createDriver(
      { animate: false, steps: SAMPLE_STEPS, components: { popover: StepPopover } },
      { popover: () => h("i", { class: "from-slot" }, "x") }
    );
    await d.drive();

    expect(popoverEl()?.querySelector(".from-slot")).not.toBeNull();
    expect(popoverEl()?.querySelector(".step-popover")).toBeNull();
  });

  it("reports only the parts a custom component renders to onPopoverRender", async () => {
    const onPopoverRender = vi.fn();
    const d = createDriver({
      animate: false,
      steps: [{ element: "#intro", popover: { title: "Custom", component: StepPopover } }],
      onPopoverRender,
    });
    await d.drive();

    const [dom] = onPopoverRender.mock.calls[0];
    expect(dom.wrapper).toBe(popoverEl());
    expect(dom.arrow).not.toBeNull();
    expect(dom.title).toBeNull();
    expect(dom.nextButton).toBeNull();
  });
});

describe("overlay and stage slots", () => {
  it("replaces the overlay and exposes the stage geometry", async () => {
    let received: OverlaySlotProps | undefined;
    const d = createDriver(
      { animate: false, steps: SAMPLE_STEPS, stagePadding: 7, stageRadius: 3, overlayColor: "#123", overlayOpacity: 0.5 },
      {
        overlay: (props: OverlaySlotProps) => {
          received = props;
          return h("div", { class: "my-overlay", onClick: props.onClick });
        },
      }
    );
    await d.drive();

    expect(document.querySelector(".driver-overlay")).toBeNull();
    expect(document.querySelector(".my-overlay")).not.toBeNull();
    expect(received?.stage).toEqual(d.state.stage);
    expect(received?.padding).toBe(7);
    expect(received?.radius).toBe(3);
    expect(received?.color).toBe("#123");
    expect(received?.opacity).toBe(0.5);
    expect(received?.transitioning).toBe(false);

    // The overlay click still runs overlayClickBehavior (close by default).
    await click(document.querySelector(".my-overlay"));
    expect(d.isActive()).toBe(false);
  });

  it("uses components.overlay when no slot is given", async () => {
    const MyOverlay = defineComponent({
      props: ["stage", "padding"],
      setup: props => () => h("div", { class: "component-overlay", "data-padding": props.padding }),
    });
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, components: { overlay: MyOverlay } });
    await d.drive();

    expect(document.querySelector(".driver-overlay")).toBeNull();
    expect(document.querySelector<HTMLElement>(".component-overlay")?.dataset.padding).toBe("10");
  });

  it("renders the stage slot inside the stage element", async () => {
    let received: StageSlotProps | undefined;
    const d = createDriver(
      { animate: false, steps: SAMPLE_STEPS },
      {
        stage: (props: StageSlotProps) => {
          received = props;
          return h("span", { class: "glow" });
        },
      }
    );
    await d.drive();

    expect(stageEl()?.querySelector(".glow")).not.toBeNull();
    expect(received?.stage).toEqual(d.state.stage);
    expect(received?.step.popover?.title).toBe("Step 1");
  });
});

describe("stage element", () => {
  const rect = (over: Partial<DOMRect>): DOMRect =>
    ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {}, ...over }) as DOMRect;

  it("tracks the padded cutout and exposes it as CSS variables", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ x: 100, y: 200, width: 50, height: 20, top: 200, left: 100 });

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, stagePadding: 10, stageRadius: 4 });
    await d.drive();

    const stage = stageEl()!;
    expect(stage.style.left).toBe("90px");
    expect(stage.style.top).toBe("190px");
    expect(stage.style.width).toBe("70px");
    expect(stage.style.height).toBe("40px");
    expect(stage.style.borderRadius).toBe("4px");
    expect(stage.style.getPropertyValue("--driver-stage-x")).toBe("90px");
    expect(stage.style.getPropertyValue("--driver-stage-width")).toBe("70px");
    expect(stage.getAttribute("aria-hidden")).toBe("true");
  });

  it("follows the element on refresh", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ x: 100, y: 200, width: 50, height: 20 });
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, stagePadding: 0 });
    await d.drive();
    expect(stageEl()?.style.left).toBe("100px");

    el.getBoundingClientRect = () => rect({ x: 300, y: 200, width: 50, height: 20 });
    await d.refresh();
    await new Promise(resolve => requestAnimationFrame(resolve));
    await flush();

    expect(stageEl()?.style.left).toBe("300px");
  });

  it("marks the stage while transitioning between elements", async () => {
    const d = createDriver({ animate: true, duration: 80, steps: SAMPLE_STEPS });
    await d.drive();
    await new Promise(resolve => setTimeout(resolve, 100));
    await flush();
    expect(stageEl()?.dataset.transitioning).toBeUndefined();

    d.moveNext();
    await nextTick();
    expect(d.state.transitioning).toBe(true);
    expect(stageEl()?.dataset.transitioning).toBe("true");

    await new Promise(resolve => setTimeout(resolve, 150));
    await flush();
    expect(d.state.transitioning).toBe(false);
    expect(stageEl()?.dataset.transitioning).toBeUndefined();
  });
});

describe("transitions", () => {
  it("runs the popover enter transition on every step", async () => {
    const d = createDriver({ animate: true, duration: 30, steps: SAMPLE_STEPS });
    d.drive();
    await nextTick();

    // The appear transition adds the enter classes on the first frame.
    expect(popoverEl()?.classList.contains("driver-popover-enter-active")).toBe(true);
    expect(popoverEl()?.classList.contains("driver-popover-enter-from")).toBe(true);
    expect(document.querySelector(".driver-overlay")?.classList.contains("driver-overlay-enter-active")).toBe(true);
  });

  it("exposes the rendered side and alignment as data attributes", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(popoverEl()?.dataset.side).toBe(popoverEl()?.className.match(/driver-popover-side-(\w+)/)?.[1]);
    expect(popoverEl()?.dataset.align).toBe(popoverEl()?.className.match(/driver-popover-align-(\w+)/)?.[1]);
  });
});
