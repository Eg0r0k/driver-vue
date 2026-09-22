import { createDriver, flush, navButton, popoverEl, SAMPLE_STEPS, useDriverHarness } from "./utils";

useDriverHarness();

// driver-vue has no capture-phase click primitive: the popover's own buttons
// and the overlay path handle their clicks and stop them there, while free
// content inside the popover (links, custom buttons) behaves normally.

const fire = (target: Element | null | undefined, type = "click"): MouseEvent => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  target?.dispatchEvent(event);
  return event;
};

describe("popover button clicks", () => {
  it("prevents the default action and stops propagation on the built-in buttons", async () => {
    const bystander = vi.fn();
    document.addEventListener("click", bystander);

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS, onNextClick: vi.fn() });
    await d.drive();

    const event = fire(navButton("next"));
    await flush();

    document.removeEventListener("click", bystander);
    expect(event.defaultPrevented).toBe(true);
    expect(bystander).not.toHaveBeenCalled();
  });

  it("never reaches the document click listener that advances on the active element", async () => {
    const d = createDriver({ animate: false, advanceOnClick: true, steps: SAMPLE_STEPS, onNextClick: vi.fn() });
    await d.drive();

    fire(navButton("next"));
    await flush();

    // onNextClick swallowed the button; had the click also reached the
    // active-element listener the index would have moved.
    expect(d.getActiveIndex()).toBe(0);
  });

  it("lets a click on the popover body itself propagate untouched", async () => {
    const bystander = vi.fn();
    document.addEventListener("click", bystander);

    const d = createDriver({ animate: false, steps: SAMPLE_STEPS });
    await d.drive();

    const event = fire(popoverEl());
    await flush();

    document.removeEventListener("click", bystander);
    expect(event.defaultPrevented).toBe(false);
    expect(bystander).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });

  it("lets links inside the description behave normally", async () => {
    const bystander = vi.fn();
    document.addEventListener("click", bystander);

    const d = createDriver({ animate: false });
    await d.highlight({
      element: "#intro",
      popover: { title: "Intro", description: '<a class="doc-link" href="#doc">Docs</a>' },
    });

    const event = fire(document.querySelector(".doc-link"));
    await flush();

    document.removeEventListener("click", bystander);
    expect(event.defaultPrevented).toBe(false);
    expect(bystander).toHaveBeenCalledTimes(1);
    expect(d.isActive()).toBe(true);
  });
});

describe("overlay clicks", () => {
  it("prevents the default action and stops propagation on the dimmed path", async () => {
    const bystander = vi.fn();
    document.addEventListener("click", bystander);

    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();

    const event = fire(document.querySelector(".driver-overlay path"));
    await flush();

    document.removeEventListener("click", bystander);
    expect(event.defaultPrevented).toBe(true);
    expect(bystander).not.toHaveBeenCalled();
  });

  it("swallows the pointer events preceding a click so the page never sees them", async () => {
    const d = createDriver({ animate: false, allowClose: false, steps: SAMPLE_STEPS });
    await d.drive();

    const path = document.querySelector(".driver-overlay path");
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup"]) {
      expect(fire(path, type).defaultPrevented, type).toBe(true);
    }
  });
});
