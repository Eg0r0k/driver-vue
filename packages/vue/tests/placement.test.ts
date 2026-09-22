import type { Alignment, Side } from "../src/types";
import { createDriver, nextFrame, popoverEl, useDriverHarness } from "./utils";

useDriverHarness();

// Characterization tests for the popover box placement. driver-vue positions
// with Floating UI (offset → flip → shift), so these pin where the box lands
// for the plain cases and what happens when the requested side has no room.
//
// happy-dom does no layout: the window is a fixed 1024x768, the element gets
// its box stubbed, and the popover reports its size through offsetWidth/
// offsetHeight (what Floating UI measures).

const rect = (over: Partial<DOMRect>): DOMRect =>
  ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {}, ...over }) as DOMRect;

// The element box used across the cases: 200x20 sitting well inside the
// viewport so every side has room by default.
const ELEMENT_BOX: Partial<DOMRect> = { top: 400, left: 400, right: 600, bottom: 420, width: 200, height: 20, x: 400, y: 400 };

const POPOVER_SIZE = { width: 200, height: 100 };

async function placePopover(opts: {
  side: Side;
  align?: Alignment;
  element?: Partial<DOMRect>;
  stagePadding?: number;
  popoverOffset?: number;
}): Promise<HTMLElement> {
  const el = document.querySelector<HTMLElement>("#intro")!;
  el.getBoundingClientRect = () => rect(opts.element ?? ELEMENT_BOX);
  el.scrollIntoView = () => {};

  // Spreading an explicit `undefined` would override the config defaults, so
  // only pass the overrides that are actually set.
  const d = createDriver({
    animate: false,
    ...(opts.stagePadding !== undefined ? { stagePadding: opts.stagePadding } : {}),
    ...(opts.popoverOffset !== undefined ? { popoverOffset: opts.popoverOffset } : {}),
  });
  await d.highlight({ element: "#intro", popover: { title: "Intro", side: opts.side, align: opts.align ?? "start" } });

  const wrapper = popoverEl() as HTMLElement;
  Object.defineProperty(wrapper, "offsetWidth", { value: POPOVER_SIZE.width, configurable: true });
  Object.defineProperty(wrapper, "offsetHeight", { value: POPOVER_SIZE.height, configurable: true });

  await d.refresh();
  await nextFrame();

  // Tear down before returning so a test can place twice without the first
  // popover lingering in the DOM; the detached wrapper keeps its styles.
  await d.destroy();

  return wrapper;
}

describe("popover box placement", () => {
  // The anchor box is expanded by stagePadding (10) so the popover clears the
  // cutout, and popoverOffset (10) is the gap between the two. Align "start"
  // lines the popover up with the cutout's leading edge.

  it("places a top popover above the element, offset by padding and offset", async () => {
    // top: (400 - 10) - 10 - 100 = 280; left: 400 - 10 = 390.
    const wrapper = await placePopover({ side: "top" });

    expect(wrapper.style.position).toBe("fixed");
    expect(wrapper.style.top).toBe("280px");
    expect(wrapper.style.left).toBe("390px");
    expect(wrapper.classList.contains("driver-popover-side-top")).toBe(true);
    expect(wrapper.classList.contains("driver-popover-align-start")).toBe(true);
  });

  it("places a bottom popover below the padded element", async () => {
    // top: (420 + 10) + 10 = 440.
    const wrapper = await placePopover({ side: "bottom" });

    expect(wrapper.style.top).toBe("440px");
    expect(wrapper.style.left).toBe("390px");
    expect(wrapper.classList.contains("driver-popover-side-bottom")).toBe(true);
  });

  it("places a left popover beside the element", async () => {
    // left: (400 - 10) - 10 - 200 = 180; top mirrors the align "start" formula: 390.
    const wrapper = await placePopover({ side: "left" });

    expect(wrapper.style.left).toBe("180px");
    expect(wrapper.style.top).toBe("390px");
    expect(wrapper.classList.contains("driver-popover-side-left")).toBe(true);
  });

  it("places a right popover beside the element", async () => {
    // left: (600 + 10) + 10 = 620.
    const wrapper = await placePopover({ side: "right" });

    expect(wrapper.style.left).toBe("620px");
    expect(wrapper.style.top).toBe("390px");
    expect(wrapper.classList.contains("driver-popover-side-right")).toBe(true);
  });

  it("centers the popover on the element for align center", async () => {
    // Element center x = 500, popover width 200 → left: 500 - 100 = 400.
    const wrapper = await placePopover({ side: "top", align: "center" });

    expect(wrapper.style.left).toBe("400px");
    expect(wrapper.classList.contains("driver-popover-align-center")).toBe(true);
  });

  it("aligns the popover's far edge for align end", async () => {
    // left: (600 + 10) - 200 = 410 (padded element end minus popover width).
    const wrapper = await placePopover({ side: "top", align: "end" });

    expect(wrapper.style.left).toBe("410px");
    expect(wrapper.classList.contains("driver-popover-align-end")).toBe(true);
  });

  it("distances the popover by stagePadding on both axes", async () => {
    // stagePadding expands the anchor on every side. With padding 0:
    // top 400 - 10 - 100 = 290, left 400.
    const flush = await placePopover({ side: "top", stagePadding: 0 });
    expect(flush.style.top).toBe("290px");
    expect(flush.style.left).toBe("400px");

    // With padding 30: top 370 - 110 = 260, left 370.
    const padded = await placePopover({ side: "top", stagePadding: 30 });
    expect(padded.style.top).toBe("260px");
    expect(padded.style.left).toBe("370px");
  });

  it("keeps the gap configured through popoverOffset", async () => {
    // top: 390 - 30 - 100 = 260.
    const wrapper = await placePopover({ side: "top", popoverOffset: 30 });

    expect(wrapper.style.top).toBe("260px");
  });

  it("flips to the opposite side when the preferred side has no room", async () => {
    // The element sits too close to the top for a 100px-tall popover, so the
    // requested "top" is rejected. Floating UI flips to the opposite side
    // (driver.js fell back to the left side first); the popover lands below.
    const wrapper = await placePopover({
      side: "top",
      element: { top: 50, left: 400, right: 600, bottom: 70, width: 200, height: 20, x: 400, y: 50 },
    });

    expect(wrapper.classList.contains("driver-popover-side-bottom")).toBe(true);
    expect(wrapper.style.top).toBe("90px");
    expect(wrapper.style.left).toBe("390px");
  });

  it("shifts the popover back into the viewport along the alignment axis", async () => {
    // Align "start" would put the popover's left edge at 1000 - 10 = 990, past
    // the viewport's right edge; shift pulls it back to 1024 - 10 - 200 = 814.
    const wrapper = await placePopover({
      side: "bottom",
      element: { top: 400, left: 1000, right: 1020, bottom: 420, width: 20, height: 20, x: 1000, y: 400 },
    });

    expect(wrapper.classList.contains("driver-popover-side-bottom")).toBe(true);
    expect(wrapper.style.left).toBe("814px");
  });

  it("still renders on a side and inside the viewport when no side has room", async () => {
    const wrapper = await placePopover({
      side: "top",
      element: { top: 0, left: 0, right: 1024, bottom: 768, width: 1024, height: 768, x: 0, y: 0 },
    });

    const side = [...wrapper.classList].find(c => c.startsWith("driver-popover-side-"));
    expect(side).toBeDefined();
    expect(side).not.toBe("driver-popover-side-over");
    expect(parseFloat(wrapper.style.left)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(wrapper.style.left)).toBeLessThanOrEqual(1024 - POPOVER_SIZE.width);
  });

  it("centers a free-floating popover in the viewport", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ popover: { title: "Floating" } });
    await nextFrame();

    const wrapper = popoverEl() as HTMLElement;
    expect(wrapper.style.position).toBe("fixed");
    expect(wrapper.style.left).toBe("50%");
    expect(wrapper.style.top).toBe("50%");
    expect(wrapper.style.transform).toBe("translate(-50%, -50%)");
    expect(wrapper.classList.contains("driver-popover-side-over")).toBe(true);
  });
});
