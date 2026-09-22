import { arrowOffsetAlong, resolveArrowSide, VIEWPORT_PADDING } from "../src/composables/useDriverPosition";
import { createDriver, popoverEl, SAMPLE_STEPS, useDriverHarness } from "./utils";

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
