import { createDriver, nextFrame, popoverEl, popoverTitle, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

// Advances the rAF loop until the predicate holds or the frame budget runs out.
// The animated stage transition settles over several frames, so polling beats a
// fixed wait.
const flushFrames = async (predicate: () => boolean, maxFrames = 120): Promise<void> => {
  for (let i = 0; i < maxFrames; i++) {
    if (predicate()) {
      return;
    }
    await nextFrame();
  }
  throw new Error("condition not met within frame budget");
};

// The library drives the CSS fade via a custom property on <body> so a single
// `duration` config controls both the JS stage slide and the CSS transitions.
const cssDuration = () => document.body.style.getPropertyValue("--driver-animation-duration");

describe("animation duration", () => {
  it("defaults to 400ms", () => {
    const d = createDriver({ steps: SAMPLE_STEPS });

    expect(d.getConfig().duration).toBe(400);
  });

  it("respects a custom duration via config", () => {
    const d = createDriver({ duration: 1200, steps: SAMPLE_STEPS });

    expect(d.getConfig().duration).toBe(1200);
  });

  it("exposes the duration to CSS as a custom property while driving", async () => {
    const d = createDriver({ duration: 1200, steps: SAMPLE_STEPS });
    await d.drive();

    expect(cssDuration()).toBe("1200ms");
  });

  it("falls back to the default on the custom property when duration is not set", async () => {
    const d = createDriver({ steps: SAMPLE_STEPS });
    await d.drive();

    expect(cssDuration()).toBe("400ms");
  });

  it("clears the custom property when the tour is destroyed", async () => {
    const d = createDriver({ duration: 1200, steps: SAMPLE_STEPS });
    await d.drive();
    await d.destroy();

    expect(cssDuration()).toBe("");
  });

  it("marks the body as animated or simple", async () => {
    const animated = createDriver({ steps: SAMPLE_STEPS });
    await animated.drive();
    expect(document.body.classList.contains("driver-fade")).toBe(true);
    await animated.destroy();

    const simple = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await simple.drive();
    expect(document.body.classList.contains("driver-simple")).toBe(true);
    expect(document.body.classList.contains("driver-fade")).toBe(false);
  });
});

describe("animated stage transition", () => {
  it("runs the rAF stage transition and settles on the next step", async () => {
    const onHighlighted = vi.fn();
    const d = createDriver({ animate: true, duration: 30, steps: SAMPLE_STEPS, onHighlighted });
    await d.drive();

    await flushFrames(() => onHighlighted.mock.calls.length >= 1);
    expect(d.getActiveIndex()).toBe(0);

    await d.moveNext();

    // Drives the stage interpolation across frames until step 2 settles.
    await flushFrames(() => onHighlighted.mock.calls.length >= 2);

    expect(d.getActiveIndex()).toBe(1);
    expect(popoverTitle()).toBe("Step 2");
    expect(d.getState("__activeStep")?.popover?.title).toBe("Step 2");
    expect(d.state.transitioning).toBe(false);
  });

  it("flags the transition and hides the popover while the stage moves", async () => {
    const onHighlighted = vi.fn();
    const d = createDriver({ animate: true, duration: 200, steps: SAMPLE_STEPS, onHighlighted });
    await d.drive();
    await flushFrames(() => onHighlighted.mock.calls.length >= 1);

    // Between two elements the popover waits for the halfway point.
    d.moveNext();
    expect(d.state.transitioning).toBe(true);
    expect(d.state.popover).toBeUndefined();

    await flushFrames(() => onHighlighted.mock.calls.length >= 2);
    expect(d.state.transitioning).toBe(false);
    expect(popoverEl()).not.toBeNull();
  });

  it("interpolates the stage rect with the configured easing", async () => {
    const rect = (x: number) =>
      ({ x, y: 0, top: 0, left: x, right: x + 100, bottom: 50, width: 100, height: 50, toJSON: () => {} }) as DOMRect;
    document.querySelector<HTMLElement>("#intro")!.getBoundingClientRect = () => rect(0);
    document.querySelector<HTMLElement>("#card-1")!.getBoundingClientRect = () => rect(1000);

    const easing = vi.fn((t: number) => t);
    const onHighlighted = vi.fn();
    const d = createDriver({ animate: true, duration: 60, easing, steps: SAMPLE_STEPS, onHighlighted });
    await d.drive();
    await flushFrames(() => onHighlighted.mock.calls.length >= 1);
    expect(d.state.stage?.x).toBe(0);

    const seen: number[] = [];
    d.moveNext();
    seen.push(d.state.stage!.x);
    await flushFrames(() => {
      seen.push(d.state.stage!.x);
      return onHighlighted.mock.calls.length >= 2;
    });

    expect(easing).toHaveBeenCalled();
    expect(easing.mock.calls.every(([t]) => t >= 0 && t <= 1)).toBe(true);
    // Monotonic from the old element to the new one, ending exactly on target.
    expect(seen[0]).toBe(0);
    expect(seen.every((x, i) => i === 0 || x >= seen[i - 1])).toBe(true);
    expect(d.state.stage?.x).toBe(1000);
  });
});
