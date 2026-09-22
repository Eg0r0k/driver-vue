import { click, createDriver, navButton, nextFrame, popoverTitle, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

const clickOverlay = () => click(document.querySelector(".driver-overlay path"));

describe("button interactions", () => {
  it("advances when the next button is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await click(navButton("next"));

    expect(d.getActiveIndex()).toBe(1);
    expect(popoverTitle()).toBe("Step 2");
  });

  it("goes back when the previous button is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive(1);
    await click(navButton("prev"));

    expect(d.getActiveIndex()).toBe(0);
    expect(popoverTitle()).toBe("Step 1");
  });

  it("closes the tour when the close button is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await click(navButton("close"));

    expect(d.isActive()).toBe(false);
  });

  it("destroys the tour when next is clicked on the final step without onDoneClick", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive(SAMPLE_STEPS.length - 1);
    await click(navButton("next"));

    expect(d.isActive()).toBe(false);
  });

  it("runs onNextClick instead of auto-advancing when provided", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onNextClick });
    await d.drive();
    await click(navButton("next"));

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(0);
  });

  it("runs onPrevClick instead of going back when provided", async () => {
    const onPrevClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onPrevClick });
    await d.drive(1);
    await click(navButton("prev"));

    expect(onPrevClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(1);
  });

  it("runs onNextClick when overlayClickBehavior is 'nextStep'", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({
      animate: false,
      overlayClickBehavior: "nextStep",
      steps: SAMPLE_STEPS,
      onNextClick,
    });
    await d.drive();
    await nextFrame();

    await clickOverlay();

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(0);
  });

  it("supports a step-level onNextClick override", async () => {
    const onNextClick = vi.fn();
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Step 1", onNextClick } },
        { element: "#card-1", popover: { title: "Step 2" } },
      ],
    });
    await d.drive();
    await click(navButton("next"));

    expect(onNextClick).toHaveBeenCalledTimes(1);
    expect(d.getActiveIndex()).toBe(0);
  });

  it("runs onDoneClick instead of onNextClick on the final step", async () => {
    const onDoneClick = vi.fn();
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDoneClick, onNextClick });
    await d.drive(SAMPLE_STEPS.length - 1);
    await click(navButton("next"));

    expect(onDoneClick).toHaveBeenCalledTimes(1);
    expect(onNextClick).not.toHaveBeenCalled();

    const [element, step, options] = onDoneClick.mock.calls[0];
    expect(element).toBe(document.querySelector(".feature-list"));
    expect(step.popover?.title).toBe("Step 3");
    expect(options.driver.state).toBe(d.state);
  });

  it("leaves teardown to onDoneClick instead of auto-destroying", async () => {
    const onDoneClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDoneClick });
    await d.drive(SAMPLE_STEPS.length - 1);
    await click(navButton("next"));

    expect(onDoneClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });

  it("does not fire onDoneClick on non-final steps", async () => {
    const onDoneClick = vi.fn();
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onDoneClick, onNextClick });
    await d.drive();
    await click(navButton("next"));

    expect(onDoneClick).not.toHaveBeenCalled();
    expect(onNextClick).toHaveBeenCalledTimes(1);
  });

  it("supports a step-level onDoneClick override", async () => {
    const onDoneClick = vi.fn();
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Step 1" } },
        { element: "#card-1", popover: { title: "Step 2", onDoneClick } },
      ],
    });
    await d.drive(1);
    await click(navButton("next"));

    expect(onDoneClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });

  it("runs onCloseClick instead of destroying when the close button is clicked", async () => {
    const onCloseClick = vi.fn();
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onCloseClick });
    await d.drive();
    await click(navButton("close"));

    expect(onCloseClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);

    const [element, step, options] = onCloseClick.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(step.popover?.title).toBe("Step 1");
    expect(options.driver.state).toBe(d.state);
  });

  it("supports a step-level onCloseClick override", async () => {
    const onCloseClick = vi.fn();
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Step 1", onCloseClick } },
        { element: "#card-1", popover: { title: "Step 2" } },
      ],
    });
    await d.drive();
    await click(navButton("close"));

    expect(onCloseClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });

  it("picks up hooks set through setConfig after a bare highlight rendered", async () => {
    // Button hooks resolve at click time, so a hook configured after the
    // popover is up still wins over the emitted default.
    const onNextClick = vi.fn();
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["next"] } });

    d.setConfig({ ...d.getConfig(), onNextClick });
    await click(navButton("next"));

    expect(onNextClick).toHaveBeenCalledTimes(1);
  });
});

describe("overlay click behaviour", () => {
  it("closes the tour when the overlay is clicked and behaviour is 'close'", async () => {
    const d = createDriver({ animate: false, overlayClickBehavior: "close", steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await clickOverlay();

    expect(d.isActive()).toBe(false);
  });

  it("keeps the tour open on overlay click when allowClose is false", async () => {
    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await clickOverlay();

    expect(d.isActive()).toBe(true);
  });

  it("runs a custom overlayClickBehavior with the active element, step and driver", async () => {
    const overlayClickBehavior = vi.fn();
    const d = createDriver({ animate: false, overlayClickBehavior, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await clickOverlay();

    expect(overlayClickBehavior).toHaveBeenCalledTimes(1);
    const [element, step, options] = overlayClickBehavior.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(step.popover?.title).toBe("Step 1");
    expect(options.driver.state).toBe(d.state);
    expect(d.isActive()).toBe(true);
  });

  it("advances to the next step when 'nextStep' overlay is clicked without onNextClick", async () => {
    const d = createDriver({ animate: false, overlayClickBehavior: "nextStep", steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await clickOverlay();

    expect(d.getActiveIndex()).toBe(1);
  });

  it("runs onDoneClick when a 'nextStep' overlay is clicked on the final step", async () => {
    const onDoneClick = vi.fn();
    const d = createDriver({ animate: false, overlayClickBehavior: "nextStep", onDoneClick, steps: SAMPLE_STEPS });
    await d.drive(SAMPLE_STEPS.length - 1);
    await nextFrame();

    await clickOverlay();

    expect(onDoneClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });
});
