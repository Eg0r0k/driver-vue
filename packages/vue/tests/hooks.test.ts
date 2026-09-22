import { click, createDriver, navButton, nextFrame, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

describe("lifecycle hooks", () => {
  it("fires onHighlightStarted synchronously with the element, step and options", async () => {
    const onHighlightStarted = vi.fn();
    const d = createDriver({ animate: false, onHighlightStarted });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(onHighlightStarted).toHaveBeenCalledTimes(1);
    const [element, step, options] = onHighlightStarted.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(step.popover?.title).toBe("Intro");
    expect(options).toMatchObject({ config: expect.any(Object), state: expect.any(Object) });
    expect(options.driver.state).toBe(d.state);
  });

  it("fires onHighlighted once the highlight settles", async () => {
    const onHighlighted = vi.fn();
    const d = createDriver({ animate: false, onHighlighted });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    await nextFrame();
    expect(onHighlighted).toHaveBeenCalledTimes(1);
  });

  it("fires onDeselected and onDestroyed on destroy", async () => {
    const onDeselected = vi.fn();
    const onDestroyed = vi.fn();
    const d = createDriver({ animate: false, onDeselected, onDestroyed });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });
    // The active element/step are committed in the rAF loop; let it run.
    await nextFrame();
    await d.destroy();

    expect(onDeselected).toHaveBeenCalledTimes(1);
    expect(onDestroyed).toHaveBeenCalledTimes(1);
  });

  it("passes the active state to onDestroyed", async () => {
    const onDestroyed = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDestroyed });
    await d.drive(1);
    await nextFrame();
    await d.destroy();

    const [, , options] = onDestroyed.mock.calls[0];
    expect(options.state.activeIndex).toBe(1);
    expect(options.state.activeElement).toBe(document.querySelector("#card-1"));
  });

  it("fires onDestroyStarted when closing, leaving teardown to the hook", async () => {
    const onDestroyStarted = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDestroyStarted });
    await d.drive();
    await click(navButton("close"));

    expect(onDestroyStarted).toHaveBeenCalledTimes(1);
    // The hook didn't call destroy(), so the tour stays active.
    expect(d.isActive()).toBe(true);
  });

  it("supports step-level hooks", async () => {
    const onHighlightStarted = vi.fn();
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" }, onHighlightStarted });

    expect(onHighlightStarted).toHaveBeenCalledTimes(1);
  });
});

describe("hook opts index", () => {
  it("exposes the active step index to state hooks", async () => {
    const onHighlighted = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onHighlighted });
    await d.drive(1);
    await nextFrame();

    const [, , options] = onHighlighted.mock.calls[0];
    expect(options.index).toBe(1);
  });

  it("exposes the index to popover button hooks", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onNextClick });
    await d.drive(0);
    await click(navButton("next"));

    const [, , options] = onNextClick.mock.calls[0];
    expect(options.index).toBe(0);
  });

  it("exposes the index to onPopoverRender", async () => {
    const onPopoverRender = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onPopoverRender });
    await d.drive(2);

    const [, options] = onPopoverRender.mock.calls[0];
    expect(options.index).toBe(2);
  });

  it("exposes the pre-destroy index to onDeselected and onDestroyed", async () => {
    const onDeselected = vi.fn();
    const onDestroyed = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDeselected, onDestroyed });
    await d.drive(2);
    await nextFrame();
    await d.destroy();

    expect(onDeselected.mock.calls[0][2].index).toBe(2);
    expect(onDestroyed.mock.calls[0][2].index).toBe(2);
  });

  it("reports the now-active index in onDeselected during a transition", async () => {
    const onDeselected = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDeselected });
    await d.drive(0);
    // Let the first highlight commit so moveNext is a real transition.
    await nextFrame();
    await d.moveNext();

    const [, , options] = onDeselected.mock.calls[0];
    expect(options.index).toBe(1);
  });
});
