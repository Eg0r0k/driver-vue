import { click, createDriver, nextFrame, overlayEl, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

const overlayPath = () => document.querySelector<SVGPathElement>(".driver-overlay path");

describe("overlay configuration", () => {
  it("renders one evenodd path inside a full-screen svg", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayEl()?.tagName.toLowerCase()).toBe("svg");
    expect(overlayEl()?.classList.contains("driver-overlay")).toBe(true);
    expect(overlayEl()?.getAttribute("viewBox")).toBe(`0 0 ${window.innerWidth} ${window.innerHeight}`);
    expect(overlayEl()?.querySelectorAll("path").length).toBe(1);
    expect(overlayPath()?.classList.contains("driver-overlay-path")).toBe(true);
  });

  it("paints the overlay with the configured colour", async () => {
    const d = createDriver({ animate: false, overlayColor: "rgb(255, 0, 0)", steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayPath()?.style.fill).toBe("rgb(255, 0, 0)");
  });

  it("falls back to the default black overlay colour", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayPath()?.style.fill).toBe("#000");
  });

  it("applies the configured overlay opacity", async () => {
    const d = createDriver({ animate: false, overlayOpacity: 0.4, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayPath()?.style.opacity).toBe("0.4");
  });

  it("rounds the cutout corners by the configured stage radius", async () => {
    const d = createDriver({ animate: false, stageRadius: 8, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    // The rounded-corner arcs in the path use the normalised radius.
    expect(overlayPath()?.getAttribute("d")).toContain("a8,8");
  });

  it("insets the cutout by the configured stage padding", async () => {
    // Element box is 0×0 in happy-dom, so with padding 20 and the default radius 5
    // the cutout's leading corner sits at (-20 + 5, -20) = (-15, -20).
    const d = createDriver({ animate: false, stagePadding: 20, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayPath()?.getAttribute("d")).toContain("M-15,-20");
  });

  it("draws square corners with no inset when padding and radius are zero", async () => {
    const d = createDriver({ animate: false, stagePadding: 0, stageRadius: 0, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    // Zero radius removes the rounded-corner arcs and the cutout starts at the origin.
    expect(overlayPath()?.getAttribute("d")).toContain("M0,0");
    expect(overlayPath()?.getAttribute("d")).not.toContain("a5,5");
  });

  it("does not close the tour when the svg itself (outside the path) is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await click(overlayEl());

    expect(d.isActive()).toBe(true);
  });

  it("closes the tour when the dimmed path is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    await click(overlayPath());

    expect(d.isActive()).toBe(false);
    expect(overlayEl()).toBeNull();
  });

  it("sets the base z-index from config", async () => {
    const d = createDriver({ animate: false, zIndex: 555, steps: SAMPLE_STEPS });
    await d.drive();
    await nextFrame();

    expect(overlayEl()?.style.zIndex).toBe("555");
  });
});
