import type { Alignment, Side } from "../src/types";
import {
  pressKey,
  click,
  createDriver,
  flush,
  navButton,
  nextFrame,
  popoverEl,
  progressText,
  SAMPLE_STEPS,
  useDriverHarness,
} from "./utils";

useDriverHarness();

const footerEl = () => document.querySelector<HTMLElement>(".driver-popover-footer");
const titleEl = () => document.querySelector<HTMLElement>(".driver-popover-title");
const descriptionEl = () => document.querySelector<HTMLElement>(".driver-popover-description");

describe("popover rendering", () => {
  it("shows no buttons for a bare highlight", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(navButton("close")).toBeNull();
    expect(footerEl()).toBeNull();
  });

  it("renders the navigation buttons for a tour", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")).not.toBeNull();
    expect(navButton("prev")).not.toBeNull();
    expect(navButton("close")).not.toBeNull();
    expect(navButton("next")?.getAttribute("type")).toBe("button");
  });

  it("honours a step-level showButtons override across a tour", async () => {
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Step 1", showButtons: ["next"] } },
        { element: "#card-1", popover: { title: "Step 2" } },
        { element: ".feature-list", popover: { title: "Step 3" } },
      ],
    });
    await d.drive();

    expect(navButton("next")).not.toBeNull();
    expect(navButton("prev")).toBeNull();

    await d.moveTo(1);
    expect(navButton("next")).not.toBeNull();
    expect(navButton("prev")).not.toBeNull();

    await d.moveTo(2);
    expect(navButton("prev")).not.toBeNull();
  });

  it("honours an explicit showButtons list", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["close"] } });

    expect(navButton("close")).not.toBeNull();
    expect(navButton("next")).toBeNull();
  });

  it("disables buttons listed in disableButtons", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", showButtons: ["next", "close"], disableButtons: ["next"] },
    });

    expect(navButton("next")?.disabled).toBe(true);
    expect(navButton("next")?.classList.contains("driver-popover-btn-disabled")).toBe(true);
  });

  it("uses custom button text", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", showButtons: ["next", "previous"], nextBtnText: "Onward", prevBtnText: "Back" },
    });

    expect(navButton("next")?.innerHTML).toBe("Onward");
    expect(navButton("prev")?.innerHTML).toBe("Back");
  });

  it("renders html in button texts, title and description", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: {
        title: "<em>Intro</em>",
        description: "See <a href='#more'>more</a>",
        showButtons: ["next"],
        nextBtnText: "Next &rarr;",
      },
    });

    expect(titleEl()?.querySelector("em")?.textContent).toBe("Intro");
    expect(descriptionEl()?.querySelector("a")).not.toBeNull();
    expect(navButton("next")?.textContent).toBe("Next →");
  });

  it("renders progress text when enabled", async () => {
    const d = createDriver({ animate: false, showProgress: true, steps: SAMPLE_STEPS });
    await d.drive();

    expect(progressText()).toBe("1 of 3");
  });

  it("formats a custom progress template", async () => {
    const d = createDriver({
      animate: false,
      showProgress: true,
      progressText: "{{current}}/{{total}}",
      steps: SAMPLE_STEPS,
    });
    await d.drive();

    expect(progressText()).toBe("1/3");
  });

  it("interpolates a step-level progress template", async () => {
    const d = createDriver({
      animate: false,
      showProgress: true,
      steps: [
        { element: "#intro", popover: { title: "Step 1", progressText: "{{current}} localized text {{total}} done" } },
        { element: "#card-1", popover: { title: "Step 2" } },
        { element: ".feature-list", popover: { title: "Step 3" } },
      ],
    });
    await d.drive();

    expect(progressText()).toBe("1 localized text 3 done");
  });

  it("marks the next button as done on the last step only", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")?.classList.contains("driver-popover-done-btn")).toBe(false);

    await d.moveTo(SAMPLE_STEPS.length - 1);

    expect(navButton("next")?.classList.contains("driver-popover-done-btn")).toBe(true);
  });

  it("applies a custom popover class", async () => {
    const d = createDriver({ animate: false, popoverClass: "my-custom-popover" });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(popoverEl()?.classList.contains("my-custom-popover")).toBe(true);
  });

  it("defaults to the bottom side", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    expect(popoverEl()?.classList.contains("driver-popover-side-bottom")).toBe(true);
    expect(popoverEl()?.dataset.side).toBe("bottom");
  });

  it("exposes the rendered side and alignment as classes", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", side: "bottom", align: "center" } });

    expect(popoverEl()?.classList.contains("driver-popover-side-bottom")).toBe(true);
    expect(popoverEl()?.classList.contains("driver-popover-align-center")).toBe(true);
    expect(popoverEl()?.dataset.align).toBe("center");
  });

  it("reflects the flipped side rather than the configured one", async () => {
    const d = createDriver({ animate: false });
    // There is no room above a zero-height element at the top of the viewport, so the popover flips away from "top".
    await d.highlight({ element: "#intro", popover: { title: "Intro", side: "top" } });

    expect(popoverEl()?.classList.contains("driver-popover-side-top")).toBe(false);
    expect(popoverEl()?.classList.contains("driver-popover-side-bottom")).toBe(true);
  });

  it("clears stale side classes when the popover is repositioned", async () => {
    const rect = (over: Partial<DOMRect>): DOMRect =>
      ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

    const el = document.querySelector<HTMLElement>("#intro")!;

    // Plenty of room above the element, so it renders on "top".
    el.getBoundingClientRect = () =>
      rect({ top: 300, left: 400, right: 600, bottom: 320, width: 200, height: 20, x: 400, y: 300 });

    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", side: "top" } });

    expect(popoverEl()?.classList.contains("driver-popover-side-top")).toBe(true);

    // No room above and only room below, so it flips to "bottom" on refresh.
    el.getBoundingClientRect = () => rect({ top: 0, left: 5, right: 1020, bottom: 5, width: 1015, height: 5, x: 5 });
    await d.refresh();
    await nextFrame();

    const sideClasses = [...popoverEl()!.classList].filter(className => className.startsWith("driver-popover-side-"));
    expect(sideClasses).toEqual(["driver-popover-side-bottom"]);
  });

  it("allows mutating the popover from onPopoverRender", async () => {
    const d = createDriver({
      animate: false,
      onPopoverRender: popover => {
        const extra = document.createElement("button");
        extra.classList.add("my-extra-btn");
        popover.footerButtons!.appendChild(extra);
      },
    });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["next"] } });

    expect(document.querySelector(".driver-popover .my-extra-btn")).not.toBeNull();
  });

  it("hands every rendered part to onPopoverRender", async () => {
    const onPopoverRender = vi.fn();
    const d = createDriver({ animate: false, showProgress: true, steps: SAMPLE_STEPS, onPopoverRender });
    await d.drive();

    const [popover] = onPopoverRender.mock.calls[0];
    expect(popover.wrapper).toBe(popoverEl());
    expect(popover.arrow?.classList.contains("driver-popover-arrow")).toBe(true);
    expect(popover.title?.textContent).toBe("Step 1");
    expect(popover.description?.textContent).toBe("First");
    expect(popover.footer).toBe(footerEl());
    expect(popover.progress?.textContent).toBe("1 of 3");
    expect(popover.previousButton).toBe(navButton("prev"));
    expect(popover.nextButton).toBe(navButton("next"));
    expect(popover.closeButton).toBe(navButton("close"));
    expect(popover.footerButtons?.classList.contains("driver-popover-navigation-btns")).toBe(true);
  });

  it("passes null for parts that are not rendered", async () => {
    const onPopoverRender = vi.fn();
    const d = createDriver({ animate: false, onPopoverRender });
    await d.highlight({ element: "#intro", popover: { description: "Only description" } });

    const [popover] = onPopoverRender.mock.calls[0];
    expect(popover.title).toBeNull();
    expect(popover.footer).toBeNull();
    expect(popover.closeButton).toBeNull();
    expect(popover.description).not.toBeNull();
  });
});

describe("hiding every button", () => {
  it("shows no buttons in a tour when showButtons is an empty list", async () => {
    const d = createDriver({ animate: false, showButtons: [], steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")).toBeNull();
    expect(navButton("prev")).toBeNull();
    expect(navButton("close")).toBeNull();
    expect(document.querySelector(".driver-popover-footer")).toBeNull();
    // The tour still runs and the keyboard still navigates.
    await pressKey("ArrowRight");
    expect(d.getActiveIndex()).toBe(1);
  });

  it("honours an empty step-level showButtons in a tour", async () => {
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Bare", showButtons: [] } },
        { element: "#card-1", popover: { title: "Buttons" } },
      ],
    });
    await d.drive();
    expect(navButton("next")).toBeNull();

    await d.moveNext();
    expect(navButton("next")).not.toBeNull();
  });
});

describe("popover config fallbacks", () => {
  it("falls back to the global button texts when the step sets none", async () => {
    const d = createDriver({ animate: false, nextBtnText: "Global Next", prevBtnText: "Global Prev" });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["next", "previous"] } });

    expect(navButton("next")?.innerHTML).toBe("Global Next");
    expect(navButton("prev")?.innerHTML).toBe("Global Prev");
  });

  it("uses the global button texts on intermediate tour steps", async () => {
    const d = createDriver({ animate: false, nextBtnText: "Global Next", steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")?.innerHTML).toBe("Global Next");
  });

  it("narrows the tour buttons to the global showButtons", async () => {
    const d = createDriver({ animate: false, showButtons: ["next"], steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")).not.toBeNull();
    expect(navButton("prev")).toBeNull();
    expect(navButton("close")).toBeNull();
  });

  it("prefers a step-level popoverClass over the global one", async () => {
    const d = createDriver({ animate: false, popoverClass: "global-theme" });
    await d.highlight({ element: "#intro", popover: { title: "Intro", popoverClass: "step-theme" } });

    expect(popoverEl()?.classList.contains("step-theme")).toBe(true);
    expect(popoverEl()?.classList.contains("global-theme")).toBe(false);
  });

  it("prefers a step-level onPopoverRender over the global one", async () => {
    const globalRender = vi.fn();
    const stepRender = vi.fn();
    const d = createDriver({ animate: false, onPopoverRender: globalRender });
    await d.highlight({ element: "#intro", popover: { title: "Intro", onPopoverRender: stepRender } });

    expect(stepRender).toHaveBeenCalledTimes(1);
    expect(globalRender).not.toHaveBeenCalled();
  });

  it("applies the global disableButtons on a bare highlight", async () => {
    const d = createDriver({ animate: false, disableButtons: ["next"] });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["next"] } });

    expect(navButton("next")?.disabled).toBe(true);
  });

  it("ignores the global disableButtons during a tour", async () => {
    // drive() always composes a step-level disableButtons (to disable
    // "previous" on the first step), which shadows the global config. This
    // pins the long-standing behaviour rather than endorsing it.
    const d = createDriver({ animate: false, disableButtons: ["next"], steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("next")?.disabled).toBe(false);
    expect(navButton("prev")?.disabled).toBe(true);
  });

  it("hides the close button in a tour when allowClose is false", async () => {
    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("close")).toBeNull();
    expect(navButton("next")).not.toBeNull();
  });

  it("honours a step-level showProgress override", async () => {
    const d = createDriver({
      animate: false,
      steps: [
        { element: "#intro", popover: { title: "Step 1", showProgress: true } },
        { element: "#card-1", popover: { title: "Step 2" } },
      ],
    });
    await d.drive();

    expect(progressText()).toBe("1 of 2");
  });
});

describe("popover accessibility contract", () => {
  it("renders the popover as a labelled dialog", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", description: "Description" } });

    const wrapper = popoverEl() as HTMLElement;
    expect(wrapper.id).toBe("driver-popover-content");
    expect(wrapper.getAttribute("role")).toBe("dialog");
    expect(wrapper.getAttribute("aria-labelledby")).toBe("driver-popover-title");
    expect(wrapper.getAttribute("aria-describedby")).toBe("driver-popover-description");
    expect(document.getElementById("driver-popover-title")).not.toBeNull();
    expect(document.getElementById("driver-popover-description")).not.toBeNull();
  });

  it("omits the title element when only a description is given", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { description: "Only description" } });

    expect(titleEl()).toBeNull();
    expect(descriptionEl()).not.toBeNull();
  });

  it("labels the close button", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(navButton("close")?.getAttribute("aria-label")).toBe("Close");
  });
});

describe("popover state exposure", () => {
  it("exposes the rendered popover DOM through getState", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    const popover = d.getState("popover");
    expect(popover?.wrapper).toBe(popoverEl());
    expect(popover?.nextButton).toBe(navButton("next"));
    expect(popover?.title?.textContent).toBe("Step 1");
  });

  it("exposes the resolved popover model through the reactive state", async () => {
    const d = createDriver({ animate: false, showProgress: true, steps: SAMPLE_STEPS });
    await d.drive();

    expect(d.state.popover).toMatchObject({
      title: "Step 1",
      description: "First",
      showButtons: ["next", "previous", "close"],
      disableButtons: ["previous"],
      showProgress: true,
      progressText: "1 of 3",
      nextBtnText: "Next",
      doneButton: false,
      side: "bottom",
      align: "start",
      centered: false,
    });
  });

  it("clears the popover from state on destroy", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });
    await d.destroy();

    expect(d.getState("popover")).toBeUndefined();
    expect(d.state.popover).toBeUndefined();
  });
});

describe("popover interaction edge cases", () => {
  it("disables the close button when close is in disableButtons", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", showButtons: ["close"], disableButtons: ["close"] },
    });

    expect(navButton("close")?.disabled).toBe(true);
    expect(navButton("close")?.classList.contains("driver-popover-btn-disabled")).toBe(true);
  });

  it("emits without navigating when next/prev are clicked on a bare highlight", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro", showButtons: ["next", "previous"] } });

    await click(navButton("next"));
    await click(navButton("prev"));

    expect(d.isActive()).toBe(true);
    expect(d.getActiveElement()).toBe(document.querySelector("#intro"));
  });

  it("lets links inside the description behave normally", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", description: '<a class="doc-link" href="#doc">Docs</a>' },
    });

    await click(document.querySelector<HTMLElement>(".doc-link"));

    expect(d.isActive()).toBe(true);
  });

  it("repositions the popover when a lazy image inside it finishes loading", async () => {
    let lazyImage: HTMLImageElement | undefined;
    const d = createDriver({
      animate: false,
      onPopoverRender: popover => {
        lazyImage = document.createElement("img");
        Object.defineProperty(lazyImage, "complete", { value: false });
        popover.description!.appendChild(lazyImage);
      },
    });
    await d.highlight({ element: "#intro", popover: { title: "Intro", description: "With image" } });

    expect(() => lazyImage?.dispatchEvent(new Event("load"))).not.toThrow();
    await flush();
    expect(popoverEl()).not.toBeNull();
  });

  it("mounts a fresh popover for every step", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    const first = popoverEl();

    await d.moveNext();

    expect(popoverEl()).not.toBe(first);
    expect(document.querySelectorAll(".driver-popover").length).toBe(1);
  });
});

describe("popover arrow", () => {
  const rect = (over: Partial<DOMRect>): DOMRect =>
    ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

  const arrowEl = () => document.querySelector<HTMLElement>(".driver-popover-arrow")!;

  // happy-dom doesn't lay anything out, so we feed the element its box and
  // give the popover real dimensions, then refresh to position against them.
  const positionArrow = async (opts: { side: Side; align?: Alignment; element: Partial<DOMRect> }): Promise<void> => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect(opts.element);
    el.scrollIntoView = () => {};

    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", side: opts.side, align: opts.align ?? "start" },
    });

    const wrapper = popoverEl() as HTMLElement;
    Object.defineProperty(wrapper, "offsetWidth", { value: 200, configurable: true });
    Object.defineProperty(wrapper, "offsetHeight", { value: 100, configurable: true });

    await d.refresh();
    await nextFrame();
  };

  it("sits on the popover's edge facing the element for a left placement", async () => {
    await positionArrow({
      side: "left",
      element: { top: 200, left: 800, right: 900, bottom: 260, width: 100, height: 60, x: 800, y: 200 },
    });

    expect(arrowEl().classList.contains("driver-popover-arrow-side-left")).toBe(true);
    expect(arrowEl().style.top).not.toBe("");
    expect(arrowEl().style.left).toBe("");
  });

  it("sits on the popover's top edge for a bottom placement", async () => {
    await positionArrow({
      side: "bottom",
      element: { top: 50, left: 300, right: 500, bottom: 80, width: 200, height: 30, x: 300, y: 50 },
    });

    expect(arrowEl().classList.contains("driver-popover-arrow-side-bottom")).toBe(true);
    expect(arrowEl().style.left).not.toBe("");
    expect(arrowEl().style.top).toBe("");
  });

  it("follows the popover when it flips to the other side", async () => {
    // No room above the element, so a "top" popover renders below and the
    // arrow moves with it.
    await positionArrow({
      side: "top",
      element: { top: 5, left: 300, right: 500, bottom: 35, width: 200, height: 30, x: 300, y: 5 },
    });

    expect(popoverEl()?.classList.contains("driver-popover-side-bottom")).toBe(true);
    expect(arrowEl().classList.contains("driver-popover-arrow-side-bottom")).toBe(true);
    expect(arrowEl().classList.contains("driver-popover-arrow-side-top")).toBe(false);
  });

  it("hides the arrow for a free-floating (over) popover", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ popover: { title: "Floating" } });

    expect(arrowEl().classList.contains("driver-popover-arrow-none")).toBe(true);
    expect([...arrowEl().classList].some(c => c.startsWith("driver-popover-arrow-side-"))).toBe(false);
    expect(arrowEl().style.top).toBe("");
    expect(arrowEl().style.left).toBe("");
  });
});

describe("done button text", () => {
  it("labels the final step's next button 'Done' by default", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive(SAMPLE_STEPS.length - 1);

    expect(navButton("next")?.innerHTML).toBe("Done");
  });

  it("uses a custom doneBtnText on the final step", async () => {
    const d = createDriver({ animate: false, doneBtnText: "Finish", steps: SAMPLE_STEPS });
    await d.drive(SAMPLE_STEPS.length - 1);

    expect(navButton("next")?.innerHTML).toBe("Finish");
  });

  it("prefers a step-level doneBtnText over the global one", async () => {
    const d = createDriver({
      animate: false,
      doneBtnText: "Global Done",
      steps: [
        { element: "#intro", popover: { title: "Step 1" } },
        { element: "#card-1", popover: { title: "Step 2", doneBtnText: "Step Done" } },
      ],
    });
    await d.drive(1);

    expect(navButton("next")?.innerHTML).toBe("Step Done");
  });
});

describe("popover offset", () => {
  const rect = (over: Partial<DOMRect>): DOMRect =>
    ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

  // Places a top-positioned popover with the given offset and returns its
  // resolved top coordinate. Asserting the *difference* between two offsets
  // tests the feature (offset distances the popover from the element) without
  // hard-coding the full positioning formula.
  const topForOffset = async (popoverOffset: number): Promise<number> => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () =>
      rect({ top: 400, left: 400, right: 600, bottom: 420, width: 200, height: 20, x: 400, y: 400 });
    el.scrollIntoView = () => {};

    const d = createDriver({ animate: false, popoverOffset });
    await d.highlight({ element: "#intro", popover: { title: "Intro", side: "top" } });
    await nextFrame();

    const top = parseFloat((popoverEl() as HTMLElement).style.top);
    await d.destroy();
    return top;
  };

  it("moves the popover further from the element as the offset grows", async () => {
    const near = await topForOffset(10);
    const far = await topForOffset(50);

    // A top-placed popover sits above the element, so a larger offset yields a
    // smaller top — further away by exactly the offset delta.
    expect(near - far).toBe(40);
  });
});
