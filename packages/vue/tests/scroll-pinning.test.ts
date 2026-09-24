import { arrowOffsetAlong, resolveArrowSide, VIEWPORT_PADDING } from "../src/composables/useDriverPosition";
import { click, createDriver, nextFrame, popoverEl, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

const rect = (over: Partial<DOMRect>): DOMRect =>
  ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

describe("popover pinning while the element scrolls away", () => {
  it("keeps the popover inside the viewport when the element is above it", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    // Scrolled far past: the element sits 500px above the viewport.
    el.getBoundingClientRect = () =>
      rect({ top: -500, bottom: -480, left: 300, right: 500, width: 200, height: 20, x: 300, y: -500 });

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, stagePadding: 0 });
    await d.drive();

    const top = parseFloat(popoverEl()!.style.top);
    expect(top).toBeGreaterThanOrEqual(VIEWPORT_PADDING);
    expect(top).toBeLessThan(window.innerHeight);
  });

  it("keeps the popover inside the viewport when the element is below it", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () =>
      rect({ top: 2000, bottom: 2020, left: 300, right: 500, width: 200, height: 20, x: 300, y: 2000 });

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, stagePadding: 0 });
    await d.drive();

    const top = parseFloat(popoverEl()!.style.top);
    expect(top).toBeLessThanOrEqual(window.innerHeight - VIEWPORT_PADDING);
    expect(top).toBeGreaterThanOrEqual(0);
  });
});

describe("arrow side on first render", () => {
  it("uses the popover's new position, not the one before positioning", async () => {
    // Layout stand-in: the popover's rect follows its inline left/top (so the
    // first measurement, taken before positioning, would be at 0,0) and has a
    // real size; the element sits well below and to the left of that.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (this.classList.contains("driver-popover")) {
        const style = (this as HTMLElement).style;
        const left = parseFloat(style.left) || 0;
        const top = parseFloat(style.top) || 0;
        return rect({ left, top, right: left + 250, bottom: top + 100, width: 250, height: 100, x: left, y: top });
      }
      return original.call(this);
    };
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () =>
      rect({ top: 300, bottom: 320, left: 100, right: 300, width: 200, height: 20, x: 100, y: 300 });

    try {
      const d = createDriver({ animate: false, stagePadding: 0 });
      await d.highlight({ element: "#intro", popover: { title: "Side", side: "right", align: "start" } });

      const arrow = document.querySelector(".driver-popover-arrow")!;
      expect(popoverEl()?.classList.contains("driver-popover-side-right")).toBe(true);
      expect(arrow.classList.contains("driver-popover-arrow-side-right")).toBe(true);
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });
});

describe("resolveArrowSide", () => {
  const popover = { top: 100, bottom: 200, left: 100, right: 300 };

  it("keeps the side while the element overlaps the popover on the placement axis", () => {
    expect(resolveArrowSide("left", { top: 150, bottom: 170, left: 320, right: 400 }, popover)).toBe("left");
    expect(resolveArrowSide("bottom", { top: 40, bottom: 60, left: 150, right: 250 }, popover)).toBe("bottom");
  });

  it("moves a side-placed arrow to the top edge when the element scrolled above", () => {
    expect(resolveArrowSide("left", { top: -50, bottom: -30, left: 320, right: 400 }, popover)).toBe("bottom");
    expect(resolveArrowSide("right", { top: 250, bottom: 270, left: 0, right: 80 }, popover)).toBe("top");
  });

  it("moves a top/bottom-placed arrow to the side facing the element", () => {
    expect(resolveArrowSide("bottom", { top: 40, bottom: 60, left: 0, right: 50 }, popover)).toBe("right");
    expect(resolveArrowSide("top", { top: 40, bottom: 60, left: 400, right: 450 }, popover)).toBe("left");
  });

  it("keeps the side when the popover has not been laid out", () => {
    expect(
      resolveArrowSide("left", { top: -50, bottom: -30, left: 0, right: 0 }, { top: 0, bottom: 0, left: 0, right: 0 })
    ).toBe("left");
  });
});

describe("arrowOffsetAlong", () => {
  it("aims at the center of the overlap, clamped clear of the corners", () => {
    // Element 150..250 over a popover 100..300: center 200 → offset 100 - half arrow.
    expect(arrowOffsetAlong(150, 250, 100, 300, 10)).toBe(95);
    // Element entirely to the left: the overlap collapses onto the start edge → corner inset.
    expect(arrowOffsetAlong(0, 50, 100, 300, 10)).toBe(15);
    // Entirely to the right → clamped to the far inset.
    expect(arrowOffsetAlong(400, 450, 100, 300, 10)).toBe(175);
  });

  it("centers the arrow when the popover is too small for the insets", () => {
    expect(arrowOffsetAlong(0, 10, 0, 30, 10)).toBe(10);
  });
});

describe("scrollAwayBehavior", () => {
  const moveIntro = (top: number) => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () =>
      rect({ top, bottom: top + 20, left: 300, right: 500, width: 200, height: 20, x: 300, y: top });
    el.scrollIntoView = () => {};
    return el;
  };

  const scrollTo = async (top: number) => {
    moveIntro(top);
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();
  };

  const start = async (config: Parameters<typeof createDriver>[0]) => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, ...config });
    await d.drive();
    await nextFrame();
    await nextFrame();
    return d;
  };

  it("sticks by default: the tour stays open however far the element goes", async () => {
    moveIntro(300);
    const d = await start({});

    await scrollTo(-2000);

    expect(d.isActive()).toBe(true);
  });

  it("closes the tour once the element is past the offset", async () => {
    moveIntro(300);
    const d = await start({ scrollAwayBehavior: "close", scrollAwayOffset: 50 });

    await scrollTo(-40);
    expect(d.isActive()).toBe(true);

    await scrollTo(-100);
    expect(d.isActive()).toBe(false);
  });

  it("does not close while allowClose is off", async () => {
    moveIntro(300);
    const d = await start({ scrollAwayBehavior: "close", allowClose: false });

    await scrollTo(-100);

    expect(d.isActive()).toBe(true);
  });

  it("ignores the element being off screen before it was ever shown", async () => {
    moveIntro(-500);
    const d = await start({ scrollAwayBehavior: "close" });

    await scrollTo(-400);

    expect(d.isActive()).toBe(true);
  });

  it("runs a hook once per departure", async () => {
    const hook = vi.fn();
    moveIntro(300);
    const d = await start({ scrollAwayBehavior: hook });

    await scrollTo(-100);
    await scrollTo(-200);
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook.mock.calls[0][0]).toBe(document.querySelector("#intro"));

    await scrollTo(300);
    await scrollTo(-100);
    expect(hook).toHaveBeenCalledTimes(2);
    expect(d.isActive()).toBe(true);
  });
});

describe("scrollBackOnClick", () => {
  const setup = async (scrollBackOnClick: boolean) => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () =>
      rect({ top: -500, bottom: -480, left: 300, right: 500, width: 200, height: 20, x: 300, y: -500 });
    const scrollIntoView = vi.fn();
    el.scrollIntoView = scrollIntoView;

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, scrollBackOnClick });
    await d.drive();
    await d.refresh();
    await nextFrame();
    scrollIntoView.mockClear();

    return { d, scrollIntoView };
  };

  it("scrolls the element back when the away popover is clicked", async () => {
    const { scrollIntoView } = await setup(true);

    expect(popoverEl()!.classList.contains("driver-popover-away")).toBe(true);
    expect(popoverEl()!.classList.contains("driver-popover-scroll-back")).toBe(true);

    await click(popoverEl()!.querySelector(".driver-popover-description"));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("does nothing on click when the option is off", async () => {
    const { scrollIntoView } = await setup(false);

    expect(popoverEl()!.classList.contains("driver-popover-away")).toBe(true);
    expect(popoverEl()!.classList.contains("driver-popover-scroll-back")).toBe(false);

    await click(popoverEl());

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
