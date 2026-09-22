import { click, createDriver, navButton, SAMPLE_STEPS, stageEl, useDriverHarness } from "./utils";

useDriverHarness();

const NO_INTERACTION_CLASS = "driver-no-interaction";

const PARENT_CLASS = "driver-active-element-parent";

const NO_SCROLL_CLASS = "driver-active-element-parent-no-scroll";

const NESTED_HTML = `
  <div id="container-a"><button id="child-a" type="button">A</button></div>
  <div id="container-b"><button id="child-b" type="button">B</button></div>
  <button id="top-level" type="button">Top</button>
`;

describe("active element parent marker", () => {
  it("marks the highlighted element's parent regardless of scrollability", async () => {
    document.body.innerHTML = NESTED_HTML;
    const d = createDriver({ animate: false, steps: [{ element: "#child-a" }] });
    await d.drive();

    expect(document.getElementById("container-a")?.classList.contains(PARENT_CLASS)).toBe(true);
  });

  it("moves the marker to the new parent when highlighting a different branch", async () => {
    document.body.innerHTML = NESTED_HTML;
    const d = createDriver({
      animate: false,
      steps: [{ element: "#child-a" }, { element: "#child-b" }],
    });
    await d.drive();
    await d.moveNext();

    expect(document.getElementById("container-a")?.classList.contains(PARENT_CLASS)).toBe(false);
    expect(document.getElementById("container-b")?.classList.contains(PARENT_CLASS)).toBe(true);
  });

  it("never marks the body element", async () => {
    document.body.innerHTML = NESTED_HTML;
    const d = createDriver({ animate: false, steps: [{ element: "#top-level" }] });
    await d.drive();

    expect(document.body.classList.contains(PARENT_CLASS)).toBe(false);
  });

  it("releases the marker when the tour is destroyed", async () => {
    document.body.innerHTML = NESTED_HTML;
    const d = createDriver({ animate: false, steps: [{ element: "#child-a" }] });
    await d.drive();
    await d.destroy();

    expect(document.getElementById("container-a")?.classList.contains(PARENT_CLASS)).toBe(false);
  });
});

describe("active element parent scroll lock", () => {
  it("does not lock a non-scrollable parent so positioned children are not clipped", async () => {
    document.body.innerHTML = `
      <div id="dropdown" style="position: relative">
        <button id="dropdown-toggle" type="button">Toggle</button>
      </div>
    `;
    const d = createDriver({ animate: false, steps: [{ element: "#dropdown-toggle" }] });
    await d.drive();

    const dropdown = document.getElementById("dropdown");
    expect(dropdown?.classList.contains(PARENT_CLASS)).toBe(true);
    expect(dropdown?.classList.contains(NO_SCROLL_CLASS)).toBe(false);
  });

  it("locks a genuinely scrollable parent", async () => {
    document.body.innerHTML = `
      <div id="scroll-area" style="overflow: auto">
        <button id="scroll-child" type="button">Child</button>
      </div>
    `;
    const d = createDriver({ animate: false, steps: [{ element: "#scroll-child" }] });
    await d.drive();

    expect(document.getElementById("scroll-area")?.classList.contains(NO_SCROLL_CLASS)).toBe(true);
  });

  it("releases the scroll lock when the tour is destroyed", async () => {
    document.body.innerHTML = `
      <div id="scroll-area" style="overflow: auto">
        <button id="scroll-child" type="button">Child</button>
      </div>
    `;
    const d = createDriver({ animate: false, steps: [{ element: "#scroll-child" }] });
    await d.drive();
    await d.destroy();

    expect(document.getElementById("scroll-area")?.classList.contains(NO_SCROLL_CLASS)).toBe(false);
  });
});

describe("active element accessibility attributes", () => {
  it("links the element to the popover dialog", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    const el = document.querySelector("#intro")!;
    expect(el.getAttribute("aria-haspopup")).toBe("dialog");
    expect(el.getAttribute("aria-expanded")).toBe("true");
    expect(el.getAttribute("aria-controls")).toBe("driver-popover-content");
    expect(document.getElementById("driver-popover-content")).not.toBeNull();
  });

  it("clears the attributes from the previous element when moving on", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await d.moveNext();

    const previous = document.querySelector("#intro")!;
    expect(previous.hasAttribute("aria-haspopup")).toBe(false);
    expect(previous.classList.contains("driver-active-element")).toBe(false);
    expect(document.querySelector("#card-1")?.classList.contains("driver-active-element")).toBe(true);
  });
});

describe("stage", () => {
  const rect = (over: Partial<DOMRect>): DOMRect =>
    ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

  it("tracks the element's box in the reactive state and the stage element", async () => {
    document.querySelector<HTMLElement>("#intro")!.getBoundingClientRect = () =>
      rect({ x: 100, y: 200, top: 200, left: 100, width: 50, height: 60 });

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(d.state.stage).toEqual({ x: 100, y: 200, width: 50, height: 60 });

    const stage = stageEl()!;
    // Padded by the default stagePadding (10).
    expect(stage.style.left).toBe("90px");
    expect(stage.style.top).toBe("190px");
    expect(stage.style.width).toBe("70px");
    expect(stage.style.height).toBe("80px");
    expect(stage.style.borderRadius).toBe("5px");
  });

  it("is removed on destroy", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    expect(stageEl()).not.toBeNull();

    await d.destroy();
    expect(stageEl()).toBeNull();
  });
});

describe("disableActiveInteraction", () => {
  it("leaves the active element interactive by default", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(document.querySelector("#intro")?.classList.contains(NO_INTERACTION_CLASS)).toBe(false);
  });

  it("blocks interaction on the active element when enabled globally", async () => {
    const d = createDriver({ animate: false, disableActiveInteraction: true, steps: SAMPLE_STEPS });
    await d.drive();

    expect(document.querySelector("#intro")?.classList.contains(NO_INTERACTION_CLASS)).toBe(true);
  });

  it("honours a per-step disableActiveInteraction override", async () => {
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", disableActiveInteraction: true, popover: { title: "Step 1" } },
        { element: "#card-1", popover: { title: "Step 2" } },
      ],
    });
    await d.drive();
    expect(document.querySelector("#intro")?.classList.contains(NO_INTERACTION_CLASS)).toBe(true);

    await click(navButton("next"));
    expect(document.querySelector("#card-1")?.classList.contains(NO_INTERACTION_CLASS)).toBe(false);
  });
});

describe("single element highlight close button", () => {
  it("closes the popover when the close button is clicked", async () => {
    const d = createDriver({ animate: false, allowClose: true });
    await d.highlight({
      element: "#intro",
      popover: { title: "Highlighted", showButtons: ["close"] },
    });

    expect(d.isActive()).toBe(true);

    await click(navButton("close"));

    expect(d.isActive()).toBe(false);
  });

  it("runs a custom onCloseClick instead of closing when provided", async () => {
    const onCloseClick = vi.fn();
    const d = createDriver({ animate: false, allowClose: true });
    await d.highlight({
      element: "#intro",
      popover: { title: "Highlighted", showButtons: ["close"], onCloseClick },
    });

    await click(navButton("close"));

    expect(onCloseClick).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });

  it("keeps the popover open on close click when allowClose is false", async () => {
    const d = createDriver({ animate: false, allowClose: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Highlighted", showButtons: ["close"] },
    });

    await click(navButton("close"));

    expect(d.isActive()).toBe(true);
  });
});

describe("step data", () => {
  it("exposes a step's data via getActiveStep", async () => {
    const d = createDriver({
      animate: false,
      steps: [{ element: "#intro", data: { id: 42, label: "intro" }, popover: { title: "Step 1" } }],
    });
    await d.drive();

    expect(d.getActiveStep()?.data).toEqual({ id: 42, label: "intro" });
  });

  it("passes the step's data through to lifecycle hooks", async () => {
    const onHighlightStarted = vi.fn();
    const d = createDriver({
      animate: false,
      steps: [{ element: "#intro", data: { id: 7 }, popover: { title: "Step 1" }, onHighlightStarted }],
    });
    await d.drive();

    const [, step] = onHighlightStarted.mock.calls[0];
    expect(step.data).toEqual({ id: 7 });
  });
});
