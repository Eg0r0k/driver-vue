import { driver, type Driver } from "../src/index";
import { flush, mountTour, nextFrame, popoverTitle, SAMPLE_STEPS, useDriverHarness } from "./utils";

// Part 1 pins the driver.js public API contract (the synchronous `driver()`
// factory with the same methods and defaults); Part 2 covers per-instance
// isolation. Rendering goes through a mounted <DriverTour> per instance.

useDriverHarness();

// The shared harness only tracks a single driver; multi-instance tests create
// several, so track and tear them all down here.
const extra: Driver[] = [];
const track = (d: Driver): Driver => {
  extra.push(d);
  mountTour(d);
  return d;
};
afterEach(() => {
  while (extra.length) {
    extra.pop()?.destroy();
  }
});

describe("backward compatibility — single instance public API", () => {
  it("applies the documented default configuration", () => {
    const config = track(driver()).getConfig();

    expect(config.animate).toBe(true);
    expect(config.duration).toBe(400);
    expect(config.allowClose).toBe(true);
    expect(config.allowScroll).toBe(true);
    expect(config.overlayClickBehavior).toBe("close");
    expect(config.overlayOpacity).toBe(0.7);
    expect(config.smoothScroll).toBe(false);
    expect(config.disableActiveInteraction).toBe(false);
    expect(config.showProgress).toBe(false);
    expect(config.stagePadding).toBe(10);
    expect(config.stageRadius).toBe(5);
    expect(config.popoverOffset).toBe(10);
    expect(config.showButtons).toEqual(["next", "previous", "close"]);
    expect(config.disableButtons).toEqual([]);
    expect(config.overlayColor).toBe("#000");
  });

  it("lets user config override the defaults", () => {
    const config = track(driver({ animate: false, stagePadding: 25, overlayColor: "#fff" })).getConfig();

    expect(config.animate).toBe(false);
    expect(config.stagePadding).toBe(25);
    expect(config.overlayColor).toBe("#fff");
    // Untouched defaults remain.
    expect(config.duration).toBe(400);
  });

  it("exposes every driver.js method", () => {
    const d = track(driver());
    const methods = [
      "isActive",
      "refresh",
      "drive",
      "setConfig",
      "setSteps",
      "getConfig",
      "getState",
      "getActiveIndex",
      "isFirstStep",
      "isLastStep",
      "getActiveStep",
      "getActiveElement",
      "getPreviousElement",
      "getPreviousStep",
      "getNextStep",
      "moveNext",
      "movePrevious",
      "moveTo",
      "hasNextStep",
      "hasPreviousStep",
      "highlight",
      "destroy",
    ] as const;

    for (const method of methods) {
      expect(typeof d[method], method).toBe("function");
    }
  });

  it("reports inert query results before drive() is called", () => {
    const d = track(driver({ animate: false, steps: SAMPLE_STEPS }));

    expect(d.isActive()).toBe(false);
    expect(d.getActiveIndex()).toBeUndefined();
    expect(d.getActiveStep()).toBeUndefined();
    expect(d.getActiveElement()).toBeUndefined();
    expect(d.isFirstStep()).toBe(false);
    expect(d.isLastStep()).toBe(false);
    expect(d.hasNextStep()).toBe(false);
    expect(d.hasPreviousStep()).toBe(false);
  });

  it("activates and exposes the active step synchronously after drive()", async () => {
    const d = track(driver({ animate: false, steps: SAMPLE_STEPS }));
    d.drive();

    // The engine state is synchronous, like driver.js; only the DOM waits for Vue.
    expect(d.isActive()).toBe(true);
    expect(d.getActiveIndex()).toBe(0);
    expect(d.isFirstStep()).toBe(true);
    expect(d.isLastStep()).toBe(false);
    expect(d.getActiveStep()?.popover?.title).toBe("Step 1");
    expect(d.getActiveElement()).toBe(document.querySelector("#intro"));

    await flush();
    expect(popoverTitle()).toBe("Step 1");
  });

  it("navigates forward and backward through the steps", async () => {
    const d = track(driver({ animate: false, steps: SAMPLE_STEPS }));
    d.drive();

    d.moveNext();
    expect(d.getActiveIndex()).toBe(1);
    expect(d.hasPreviousStep()).toBe(true);
    expect(d.hasNextStep()).toBe(true);
    await flush();
    expect(popoverTitle()).toBe("Step 2");

    d.moveTo(2);
    expect(d.getActiveIndex()).toBe(2);
    expect(d.isLastStep()).toBe(true);
    expect(d.hasNextStep()).toBe(false);

    d.movePrevious();
    expect(d.getActiveIndex()).toBe(1);
    expect(d.hasPreviousStep()).toBe(true);
  });

  it("updates config and steps in place via setConfig / setSteps", async () => {
    const d = track(driver({ animate: false }));

    d.setConfig({ animate: false, stagePadding: 30 });
    expect(d.getConfig().stagePadding).toBe(30);

    d.setSteps([{ element: "#card-1", popover: { title: "Only" } }]);
    d.drive();
    await flush();
    expect(popoverTitle()).toBe("Only");
    expect(d.isLastStep()).toBe(true);
  });

  it("highlights a single element without a steps array", async () => {
    const d = track(driver({ animate: false }));
    d.highlight({ element: "#intro", popover: { title: "Solo" } });
    await flush();

    expect(d.isActive()).toBe(true);
    expect(popoverTitle()).toBe("Solo");
    expect(d.getActiveElement()).toBe(document.querySelector("#intro"));
  });

  it("tears down DOM and state on destroy()", async () => {
    const d = track(driver({ animate: false, steps: SAMPLE_STEPS }));
    d.drive();
    await flush();
    expect(document.querySelector(".driver-popover")).not.toBeNull();
    expect(document.body.classList.contains("driver-active")).toBe(true);

    d.destroy();
    await flush();

    expect(d.isActive()).toBe(false);
    expect(document.querySelector(".driver-popover")).toBeNull();
    expect(document.body.classList.contains("driver-active")).toBe(false);
    expect(d.getActiveStep()).toBeUndefined();
  });

  it("passes config, state and driver into lifecycle hooks", async () => {
    const onHighlighted = vi.fn();
    const d = track(
      driver({
        animate: false,
        steps: [{ element: "#intro", popover: { title: "Hooked" }, onHighlighted }],
      })
    );
    d.drive();
    // onHighlighted settles in the animation-frame loop.
    await nextFrame();

    expect(onHighlighted).toHaveBeenCalledTimes(1);
    const [element, step, opts] = onHighlighted.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(step.popover?.title).toBe("Hooked");
    expect(opts.driver).toBe(d);
    expect(opts.config.animate).toBe(false);
    expect(opts.state.activeIndex).toBe(0);
  });
});

describe("per-instance isolation", () => {
  it("gives each instance its own config", () => {
    const d1 = track(driver({ animate: false, stagePadding: 1 }));
    const d2 = track(driver({ animate: false, stagePadding: 2 }));

    expect(d1.getConfig().stagePadding).toBe(1);
    expect(d2.getConfig().stagePadding).toBe(2);
  });

  it("drives each instance's own steps", async () => {
    const d1 = track(driver({ animate: false, steps: [{ element: "#intro", popover: { title: "D1 Step" } }] }));
    track(driver({ animate: false, steps: [{ element: "#card-1", popover: { title: "D2 Step" } }] }));

    d1.drive();
    await flush();

    expect(popoverTitle()).toBe("D1 Step");
  });

  it("keeps each instance's active state independent", () => {
    const d1 = track(driver({ animate: false, steps: SAMPLE_STEPS }));
    const d2 = track(driver({ animate: false, steps: SAMPLE_STEPS }));

    d1.drive();
    d1.moveNext();

    expect(d2.isActive()).toBe(false);
    expect(d2.getActiveIndex()).toBeUndefined();
    expect(d2.state.isActive).toBe(false);
  });

  it("keeps setConfig changes scoped to one instance", () => {
    const d1 = track(driver({ animate: false, stagePadding: 1 }));
    const d2 = track(driver({ animate: false, stagePadding: 2 }));

    d1.setConfig({ animate: false, stagePadding: 10 });

    expect(d1.getConfig().stagePadding).toBe(10);
    expect(d2.getConfig().stagePadding).toBe(2);
  });

  it("keeps setSteps scoped to one instance", async () => {
    const d1 = track(driver({ animate: false }));
    const d2 = track(driver({ animate: false }));

    d1.setSteps([{ element: "#intro", popover: { title: "D1 only" } }]);
    d2.setSteps([{ element: "#card-1", popover: { title: "D2 only" } }]);

    d1.drive();
    await flush();

    expect(popoverTitle()).toBe("D1 only");
  });

  it("passes each instance's own driver into its hooks", async () => {
    const seen: Driver[] = [];
    const d1 = track(
      driver({
        animate: false,
        steps: [
          {
            element: "#intro",
            popover: { title: "D1" },
            onHighlighted: (_element, _step, opts) => seen.push(opts.driver),
          },
        ],
      })
    );
    track(driver({ animate: false, steps: SAMPLE_STEPS }));

    d1.drive();
    await nextFrame();

    expect(seen[0]).toBe(d1);
  });
});
