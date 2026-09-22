import { createDriver, nextFrame, popoverTitle, pressKey, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

describe("keyboard control", () => {
  it("closes the tour when Escape is pressed", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await pressKey("Escape");

    expect(d.isActive()).toBe(false);
  });

  it("ignores Escape when allowClose is false", async () => {
    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();
    await pressKey("Escape");

    expect(d.isActive()).toBe(true);
  });

  it("navigates with the arrow keys", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    // Arrow handlers no-op mid-transition, so let the highlight settle first.
    await nextFrame();

    await pressKey("ArrowRight");
    await nextFrame();
    expect(d.getActiveIndex()).toBe(1);
    expect(popoverTitle()).toBe("Step 2");

    await pressKey("ArrowLeft");
    await nextFrame();
    expect(d.getActiveIndex()).toBe(0);
  });

  it("does not close the tour when ArrowLeft is pressed on the first step", async () => {
    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await pressKey("ArrowLeft");
    await nextFrame();

    expect(d.isActive()).toBe(true);
    expect(d.getActiveIndex()).toBe(0);
  });

  it("runs onDoneClick when ArrowRight is pressed on the final step", async () => {
    const onDoneClick = vi.fn();
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDoneClick, onNextClick });
    await d.drive(SAMPLE_STEPS.length - 1);
    await nextFrame();

    await pressKey("ArrowRight");

    expect(onDoneClick).toHaveBeenCalledTimes(1);
    expect(onNextClick).not.toHaveBeenCalled();
    expect(d.isActive()).toBe(true);
  });

  it("ignores keys when allowKeyboardControl is false", async () => {
    const d = createDriver({ animate: false, allowKeyboardControl: false, steps: SAMPLE_STEPS });
    await d.drive();

    await pressKey("ArrowRight");
    expect(d.getActiveIndex()).toBe(0);

    await pressKey("Escape");
    expect(d.isActive()).toBe(true);
  });

  it("runs onPrevClick instead of moving back when ArrowLeft is pressed", async () => {
    const onPrevClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onPrevClick });
    await d.drive(1);
    await nextFrame();

    await pressKey("ArrowLeft");

    expect(onPrevClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(1);
  });

  it("runs onNextClick instead of advancing when ArrowRight is pressed", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onNextClick });
    await d.drive();
    await nextFrame();

    await pressKey("ArrowRight");

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(0);
  });

  it("ignores arrow keys while a highlight transition is in flight", () => {
    const d = createDriver({ animate: true, steps: SAMPLE_STEPS });
    // Not awaited: no frame ran, so the transition callback is still set and arrows no-op.
    void d.drive();
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }));

    expect(d.getActiveIndex()).toBe(0);
  });
});
