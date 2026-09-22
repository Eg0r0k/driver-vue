import {
  createDriver,
  nextFrame,
  popoverDescription,
  popoverEl,
  popoverTitle,
  pressKey,
  SAMPLE_STEPS,
  useDriverHarness,
} from "./utils";

useDriverHarness();

describe("lifecycle", () => {
  it("is inactive before anything is highlighted", () => {
    const d = createDriver();
    expect(d.isActive()).toBe(false);
    expect(popoverEl()).toBeNull();
  });

  it("activates and renders a popover when highlighting an element", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", description: "The intro paragraph" } });

    expect(d.isActive()).toBe(true);
    expect(document.body.classList.contains("driver-active")).toBe(true);
    expect(popoverTitle()).toBe("Intro");
    expect(popoverDescription()).toBe("The intro paragraph");
  });

  it("marks the highlighted element as active and exposes it", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(document.querySelector("#intro")?.classList.contains("driver-active-element")).toBe(true);
    expect(d.getActiveElement()).toBe(document.querySelector("#intro"));
  });

  it("supports element-less modal popovers via a dummy element", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ popover: { title: "Modal", description: "No element" } });

    expect(d.isActive()).toBe(true);
    expect(popoverTitle()).toBe("Modal");
    expect(document.getElementById("driver-dummy-element")).not.toBeNull();
    expect(popoverEl()?.classList.contains("driver-popover-side-over")).toBe(true);
  });

  it("resolves an element returned from a function", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: () => document.querySelector("#intro")!, popover: { title: "Intro" } });

    expect(d.getActiveElement()).toBe(document.querySelector("#intro"));
    expect(popoverTitle()).toBe("Intro");
  });

  it("resolves a directly passed element node", async () => {
    const d = createDriver({ animate: false });
    const node = document.querySelector("#card-1")!;
    await d.highlight({ element: node, popover: { title: "Card" } });

    expect(d.getActiveElement()).toBe(node);
    expect(popoverTitle()).toBe("Card");
  });

  it("mounts the dummy element for a tour step whose selector matches nothing", async () => {
    const d = createDriver({
      animate: false,
      steps: [{ element: "#nonexistent", popover: { title: "Ghost" } }],
    });
    await d.drive();

    expect(document.getElementById("driver-dummy-element")).not.toBeNull();
    expect(popoverTitle()).toBe("Ghost");
  });

  it("tears the DOM and state down on destroy", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });
    expect(document.querySelector(".driver-overlay")).not.toBeNull();

    await d.destroy();

    expect(d.isActive()).toBe(false);
    expect(popoverEl()).toBeNull();
    expect(document.querySelector(".driver-overlay")).toBeNull();
    expect(document.querySelector(".driver-stage")).toBeNull();
    expect(document.body.classList.contains("driver-active")).toBe(false);
    expect(document.querySelector(".driver-active-element")).toBeNull();
    expect(d.getActiveIndex()).toBeUndefined();
    expect(d.getState("popover")).toBeUndefined();
  });
});

describe("drive guards", () => {
  it("logs an error and stays inactive when there are no steps", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const d = createDriver({ animate: false });
    await d.drive();

    expect(error).toHaveBeenCalledWith("No steps to drive through");
    expect(d.isActive()).toBe(false);
    error.mockRestore();
  });

  it("destroys instead of driving an out-of-range step index", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive(99);

    expect(d.isActive()).toBe(false);
  });

  it("ignores moveNext and movePrevious before the tour starts", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.moveNext();
    await d.movePrevious();

    expect(d.isActive()).toBe(false);
    expect(d.getActiveIndex()).toBeUndefined();
  });
});

describe("dummy-element hooks", () => {
  it("passes an undefined element to onDeselected and onDestroyed for a dummy highlight", async () => {
    const onDeselected = vi.fn();
    const onDestroyed = vi.fn();
    const d = createDriver({ animate: false, onDeselected, onDestroyed });
    await d.highlight({ popover: { title: "Modal" } });
    await nextFrame();

    await d.destroy();

    expect(onDeselected).toHaveBeenCalledTimes(1);
    expect(onDestroyed).toHaveBeenCalledTimes(1);
    expect(onDeselected.mock.calls[0][0]).toBeUndefined();
    expect(onDestroyed.mock.calls[0][0]).toBeUndefined();
  });

  it("passes an undefined element to onDestroyStarted for a dummy highlight", async () => {
    const onDestroyStarted = vi.fn();
    const d = createDriver({ animate: false, onDestroyStarted });
    await d.highlight({ popover: { title: "Modal" } });
    await nextFrame();

    await pressKey("Escape");

    expect(onDestroyStarted).toHaveBeenCalledTimes(1);
    expect(onDestroyStarted.mock.calls[0][0]).toBeUndefined();
  });
});

describe("popover state exposure", () => {
  it("exposes the rendered popover DOM through getState", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    const popover = d.getState("popover");
    expect(popover?.wrapper).toBe(popoverEl());
    expect(popover?.title?.textContent).toBe("Intro");
  });

  it("exposes the rendered popover through state inside onPopoverRender", async () => {
    let stateMatchesArg: boolean | undefined;
    const d = createDriver({
      animate: false,
      onPopoverRender: (popover, opts) => {
        stateMatchesArg = opts.state.popover === popover;
      },
    });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(stateMatchesArg).toBe(true);
  });

  it("keeps the reported popover DOM current across steps", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    const first = d.getState("popover")?.wrapper;
    await d.moveNext();

    expect(d.getState("popover")?.wrapper).toBe(popoverEl());
    expect(d.getState("popover")?.wrapper).not.toBe(first);
  });
});
