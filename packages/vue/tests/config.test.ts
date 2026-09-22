import { createDriver, popoverTitle, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

describe("configuration & state", () => {
  it("returns the active configuration via getConfig", () => {
    const d = createDriver({ animate: false, stagePadding: 12 });

    expect(d.getConfig().animate).toBe(false);
    expect(d.getConfig().stagePadding).toBe(12);
  });

  it("updates configuration via setConfig", () => {
    const d = createDriver({ animate: false });
    d.setConfig({ animate: false, stagePadding: 25 });

    expect(d.getConfig().stagePadding).toBe(25);
  });

  it("replaces the steps via setSteps", async () => {
    const d = createDriver({ animate: false });
    await d.setSteps([{ element: "#card-1", popover: { title: "Replaced" } }]);
    await d.drive();

    expect(popoverTitle()).toBe("Replaced");
    expect(d.isLastStep()).toBe(true);
  });

  it("exposes the documented state shape via getState", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    expect(d.getState("isInitialized")).toBe(true);
    expect(d.getState("activeIndex")).toBe(0);

    const state = d.getState();
    expect(state.activeStep?.popover?.title).toBe("Step 1");
    expect(state.activeElement).toBe(document.querySelector("#intro"));
  });

  it("mirrors the public state into the reactive state", async () => {
    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive(1);

    expect(d.state.isActive).toBe(true);
    expect(d.state.activeIndex).toBe(1);
    expect(d.state.activeStep?.popover?.title).toBe("Step 2");
    expect(d.state.activeElement).toBe(document.querySelector("#card-1"));
    expect(d.state.popover?.title).toBe("Step 2");
  });

  it("refreshes an active highlight without throwing", async () => {
    const d = createDriver({ animate: false });
    await d.highlight({ element: "#intro", popover: { title: "Intro" } });

    await expect(d.refresh()).resolves.toBeUndefined();
    expect(d.isActive()).toBe(true);
  });
});
