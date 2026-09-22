import DriverBoxOverlay from "../src/components/DriverBoxOverlay.vue";
import { click, createDriver, overlayEl, SAMPLE_STEPS, stageEl, useDriverHarness } from "./utils";

useDriverHarness();

const rect = (over: Partial<DOMRect>): DOMRect =>
  ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...over }) as DOMRect;

describe("DriverBoxOverlay", () => {
  it("renders a box-shadow cutout at the padded stage instead of the svg", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ x: 100, y: 200, width: 50, height: 20 });

    const d = createDriver({
      animate: false,
      steps: SAMPLE_STEPS,
      stagePadding: 10,
      stageRadius: 6,
      overlayColor: "#123456",
      overlayOpacity: 0.5,
      components: { overlay: DriverBoxOverlay },
    });
    await d.drive();

    expect(document.querySelector("svg.driver-overlay")).toBeNull();
    const root = document.querySelector<HTMLElement>(".driver-box-overlay")!;
    const cutout = root.querySelector<HTMLElement>(".driver-box-overlay-cutout")!;
    expect(root.classList.contains("driver-overlay")).toBe(true);
    expect(cutout.style.left).toBe("90px");
    expect(cutout.style.top).toBe("190px");
    expect(cutout.style.width).toBe("70px");
    expect(cutout.style.height).toBe("40px");
    expect(cutout.style.borderRadius).toBe("6px");
    expect(cutout.style.boxShadow).toContain("200vmax");
    expect(cutout.style.opacity).toBe("0.5");
  });

  it("flags CSS-driven movement when the engine animation is off", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, components: { overlay: DriverBoxOverlay } });
    await d.drive();

    expect(document.querySelector<HTMLElement>(".driver-box-overlay")?.dataset.animated).toBeUndefined();
    expect(document.body.classList.contains("driver-simple")).toBe(true);
  });

  it("marks engine-driven movement when animate is on", async () => {
    const d = createDriver({ animate: true, steps: SAMPLE_STEPS, components: { overlay: DriverBoxOverlay } });
    await d.drive();

    expect(document.querySelector<HTMLElement>(".driver-box-overlay")?.dataset.animated).toBe("true");
  });

  it("runs the overlay click behaviour when the dimmed area is clicked", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, components: { overlay: DriverBoxOverlay } });
    await d.drive();

    await click(document.querySelector(".driver-box-overlay"));

    expect(d.isActive()).toBe(false);
  });
});

describe("stageClass and overlayClass", () => {
  it("adds the configured classes to the stage box and the overlay root", async () => {
    const d = createDriver({
      animate: false,
      steps: SAMPLE_STEPS,
      stageClass: "fx-glow fx-spring",
      overlayClass: "fx-spring",
    });
    await d.drive();

    expect(stageEl()?.classList.contains("fx-glow")).toBe(true);
    expect(stageEl()?.classList.contains("fx-spring")).toBe(true);
    expect(overlayEl()?.classList.contains("fx-spring")).toBe(true);
  });
});
