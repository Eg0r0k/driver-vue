import { createApp, h, nextTick, type App } from "vue";
import { createHints as createHintsCore, hints as hintsFactory, type DriverHint, type Hints } from "../src/core/hints";
import DriverHints from "../src/components/DriverHints.vue";
import { createDriver, DEMO_HTML, flush, nextFrame, popoverEl, popoverTitle, click, useDriverHarness } from "./utils";

// happy-dom's IntersectionObserver never fires; the beacon visibility tests
// install a controllable fake, the rest just need the constructor to exist.
type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
let observerCallbacks: { callback: ObserverCallback; target: Element; disconnected: boolean }[] = [];

class FakeIntersectionObserver {
  callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    observerCallbacks.push({ callback: this.callback, target, disconnected: false });
  }

  disconnect() {
    observerCallbacks
      .filter(entry => entry.callback === this.callback)
      .forEach(entry => {
        entry.disconnected = true;
      });
  }
}

async function intersect(target: Element, isIntersecting: boolean) {
  observerCallbacks
    .filter(entry => entry.target === target && !entry.disconnected)
    .forEach(entry => entry.callback([{ isIntersecting }]));
  await flush();
}

const SAMPLE_HINTS: DriverHint[] = [
  { element: "#intro", id: "intro", popover: { title: "Intro hint", description: "About the intro" } },
  { element: "#card-1", id: "card", popover: { title: "Card hint" } },
];

// The hints API is synchronous; the DOM renders on the next tick, so the
// rendering methods are wrapped to await it.
type AsyncMethods = "show" | "hide" | "open" | "close" | "toggle" | "dismiss" | "restore" | "restoreAll" | "setHints" | "refresh";
type TestHints = Omit<Hints, AsyncMethods> & {
  [K in AsyncMethods]: (...args: Parameters<Hints[K]>) => Promise<void>;
};

const mounted: { app: App; host: HTMLElement; hints: Hints }[] = [];

function mountHints(instance: Hints, slots?: Record<string, any>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp({ render: () => h(DriverHints, { hints: instance }, slots) });
  app.config.warnHandler = () => {};
  app.mount(host);
  mounted.push({ app, host, hints: instance });
}

// The overlay leaves through a <Transition>, which needs a couple of frames.
async function settle(): Promise<void> {
  await flush();
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await flush();
}

function wrapHints(instance: Hints): TestHints {
  const wrap =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    async (...args: A) => {
      fn(...args);
      await settle();
    };

  return {
    ...instance,
    show: wrap(instance.show),
    hide: wrap(instance.hide),
    open: wrap(instance.open),
    close: wrap(instance.close),
    toggle: wrap(instance.toggle),
    dismiss: wrap(instance.dismiss),
    restore: wrap(instance.restore),
    restoreAll: wrap(instance.restoreAll),
    setHints: wrap(instance.setHints),
    refresh: wrap(instance.refresh),
  };
}

function createHints(config?: Parameters<typeof createHintsCore>[0], slots?: Record<string, any>): TestHints {
  const instance = createHintsCore(config);
  mountHints(instance, slots);
  return wrapHints(instance);
}

const beacons = () => Array.from(document.querySelectorAll<HTMLButtonElement>(".driver-hint"));
const beaconFor = (id: string) => document.querySelector<HTMLButtonElement>(`.driver-hint[data-hint-id="${id}"]`)!;
const dismissButton = () => document.querySelector<HTMLButtonElement>(".driver-popover-next-btn");
const overlayEl = () => document.querySelector<SVGSVGElement>(".driver-hint-overlay");
const overlayPath = () => overlayEl()?.querySelector("path");

const rect = (over: Partial<DOMRect>): DOMRect =>
  ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {}, ...over }) as DOMRect;

useDriverHarness();

beforeEach(() => {
  document.body.innerHTML = DEMO_HTML;
  observerCallbacks = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(async () => {
  while (mounted.length) {
    const { app, host, hints } = mounted.pop()!;
    hints.hide();
    await nextTick();
    app.unmount();
    host.remove();
  }
  vi.unstubAllGlobals();
});

describe("mounting beacons", () => {
  it("mounts nothing until show() is called", async () => {
    createHints({ hints: SAMPLE_HINTS });
    await flush();

    expect(beacons()).toHaveLength(0);
  });

  it("mounts a beacon per hint on show()", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();

    expect(beacons()).toHaveLength(2);
  });

  it("renders the beacon as a labelled button with a dot and a pulse", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();

    const beacon = beaconFor("intro");
    expect(beacon.tagName).toBe("BUTTON");
    expect(beacon.type).toBe("button");
    expect(beacon.getAttribute("aria-label")).toBe("Intro hint");
    expect(beacon.getAttribute("aria-haspopup")).toBe("dialog");
    expect(beacon.getAttribute("aria-expanded")).toBe("false");
    expect(beacon.querySelector(".driver-hint-dot")).not.toBeNull();
    expect(beacon.querySelector(".driver-hint-pulse")).not.toBeNull();
  });

  it("falls back to a generic label when the hint has no title", async () => {
    await createHints({ hints: [{ element: "#intro" }] }).show();

    expect(beacons()[0].getAttribute("aria-label")).toBe("Show hint");
  });

  it("skips a hint whose element does not exist", async () => {
    await createHints({ hints: [{ element: "#nope" }, { element: "#intro" }] }).show();

    expect(beacons()).toHaveLength(1);
  });

  it("picks up an element that appears later on show()", async () => {
    const productHints = createHints({ hints: [{ element: "#late" }, ...SAMPLE_HINTS] });
    await productHints.show();
    expect(beacons()).toHaveLength(2);

    const late = document.createElement("div");
    late.id = "late";
    document.body.appendChild(late);
    await productHints.show();

    expect(beacons()).toHaveLength(3);
  });

  it("resolves an element node and a function element", async () => {
    await createHints({
      hints: [{ element: document.querySelector("#intro")! }, { element: () => document.querySelector("#card-1")! }],
    }).show();

    expect(beacons()).toHaveLength(2);
  });

  it("is idempotent across repeated show() calls", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.show();

    expect(beacons()).toHaveLength(2);
  });

  it("opts a beacon out of the pulse animation", async () => {
    await createHints({ hints: [{ element: "#intro", beacon: { animate: false } }] }).show();

    expect(beacons()[0].classList.contains("driver-hint-no-animation")).toBe(true);
  });

  it("applies a custom beacon class over the global default", async () => {
    await createHints({
      beacon: { className: "global-beacon" },
      hints: [{ element: "#intro", beacon: { className: "hint-beacon" } }, { element: "#card-1" }],
    }).show();

    expect(beacons()[0].classList.contains("hint-beacon")).toBe(true);
    expect(beacons()[1].classList.contains("global-beacon")).toBe(true);
  });

  it("renders custom beacon content through the beacon slot", async () => {
    await createHints(
      { hints: SAMPLE_HINTS },
      { beacon: (scope: { id: string }) => h("i", { class: "my-beacon" }, scope.id) }
    ).show();

    expect(beaconFor("intro").querySelector(".my-beacon")?.textContent).toBe("intro");
    expect(beaconFor("intro").querySelector(".driver-hint-dot")).toBeNull();
  });
});

describe("beacon positioning", () => {
  // Element box: 200x20 at (400, 400).
  const ELEMENT_BOX = { top: 400, left: 400, right: 600, bottom: 420, width: 200, height: 20 };

  async function positionFor(beacon?: DriverHint["beacon"]) {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect(ELEMENT_BOX);

    await createHints({ hints: [{ element: "#intro", beacon }] }).show();

    const mountedBeacon = beacons()[0];
    return { top: mountedBeacon.style.top, left: mountedBeacon.style.left };
  }

  it("defaults to the element's top-right corner", async () => {
    expect(await positionFor()).toEqual({ top: "400px", left: "600px" });
  });

  it.each([
    [{ side: "top", align: "start" }, { top: "400px", left: "400px" }],
    [{ side: "top", align: "center" }, { top: "400px", left: "500px" }],
    [{ side: "top", align: "end" }, { top: "400px", left: "600px" }],
    [{ side: "bottom", align: "start" }, { top: "420px", left: "400px" }],
    [{ side: "bottom", align: "center" }, { top: "420px", left: "500px" }],
    [{ side: "left", align: "start" }, { top: "400px", left: "400px" }],
    [{ side: "left", align: "center" }, { top: "410px", left: "400px" }],
    [{ side: "left", align: "end" }, { top: "420px", left: "400px" }],
    [{ side: "right", align: "center" }, { top: "410px", left: "600px" }],
  ] as const)("anchors the beacon for %o", async (beacon, expected) => {
    expect(await positionFor(beacon)).toEqual(expected);
  });

  it("nudges the beacon by offsetX and offsetY", async () => {
    expect(await positionFor({ side: "top", align: "end", offsetX: 12, offsetY: -8 })).toEqual({
      top: "392px",
      left: "612px",
    });
  });

  it("repositions the beacons on scroll", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect(ELEMENT_BOX);
    await createHints({ hints: [{ element: "#intro" }] }).show();

    expect(beacons()[0].style.top).toBe("400px");

    el.getBoundingClientRect = () => rect({ ...ELEMENT_BOX, top: 100, bottom: 120 });
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(beacons()[0].style.top).toBe("100px");
  });

  it("repositions the beacons when a nested container scrolls", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect(ELEMENT_BOX);
    await createHints({ hints: [{ element: "#intro" }] }).show();

    el.getBoundingClientRect = () => rect({ ...ELEMENT_BOX, top: 200, bottom: 220 });
    // A scroll inside a container never reaches the window while bubbling, so
    // this only repositions if the listener is registered in capture phase.
    document.querySelector(".feature-list")!.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(beacons()[0].style.top).toBe("200px");
  });

  it("repositions the beacons on resize", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect(ELEMENT_BOX);
    await createHints({ hints: [{ element: "#intro" }] }).show();

    el.getBoundingClientRect = () => rect({ ...ELEMENT_BOX, left: 50, right: 250 });
    window.dispatchEvent(new Event("resize"));
    await nextFrame();

    expect(beacons()[0].style.left).toBe("250px");
  });
});

describe("popover anchoring", () => {
  it("anchors the popover to the beacon and renders the hint arrow", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    await productHints.open("intro");

    expect(productHints.state.popoverAnchor).toBe(beaconFor("intro"));
    expect(popoverEl()?.className).toContain("driver-hint-popover");
    expect(document.querySelector(".driver-popover-arrow")).not.toBeNull();
    expect(document.querySelector(".driver-popover-arrow")?.classList.contains("driver-popover-arrow-none")).toBe(false);
  });
});

describe("overlay", () => {
  it("shows no overlay by default", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.open("intro");

    expect(overlayEl()).toBeNull();
  });

  it("dims the page while a hint is open when enabled", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();

    expect(overlayEl()).toBeNull();

    await productHints.open("intro");
    expect(overlayEl()).not.toBeNull();

    await productHints.close();
    expect(overlayEl()).toBeNull();
  });

  it("keeps a single overlay when swapping between hints", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();

    await productHints.open("intro");
    await productHints.open("card");

    expect(document.querySelectorAll(".driver-hint-overlay")).toHaveLength(1);
  });

  it("applies the configured color and opacity", async () => {
    const productHints = createHints({
      hints: SAMPLE_HINTS,
      overlay: true,
      overlayColor: "#123456",
      overlayOpacity: 0.4,
    });
    await productHints.show();
    await productHints.open("intro");

    expect(["#123456", "rgb(18, 52, 86)"]).toContain(overlayPath()?.style.fill);
    expect(overlayPath()?.style.opacity).toBe("0.4");
  });

  it("cuts the hint's element out of the dim", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ x: 400, y: 300, width: 200, height: 40 });

    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    // Full-screen subpath plus a cutout subpath. The cutout starts at the
    // element's x minus the 10px padding, plus the 5px corner radius: 395.
    const d = overlayPath()?.getAttribute("d") ?? "";
    expect(d).toContain(`M${window.innerWidth},0L0,0L0,${window.innerHeight}`);
    expect(d).toContain("M395,290");
  });

  it("tracks the element when the page scrolls", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ x: 400, y: 300, width: 200, height: 40 });

    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    el.getBoundingClientRect = () => rect({ x: 400, y: 100, width: 200, height: 40 });
    window.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(overlayPath()?.getAttribute("d")).toContain("M395,90");
  });

  it("closes the hint when the dimmed page is clicked", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    // Clicks land on the dimmed path (the svg lets pointer events through).
    await click(overlayPath());

    expect(popoverEl()).toBeNull();
    expect(overlayEl()).toBeNull();
  });

  it("removes the overlay when the open hint is dismissed", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    await productHints.dismiss("intro");

    expect(overlayEl()).toBeNull();
  });

  it("removes the overlay on hide()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    await productHints.hide();

    expect(overlayEl()).toBeNull();
  });

  it("hides the beacon while its popover is open, and restores it on close", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();

    await productHints.open("intro");
    expect(beaconFor("intro")).toBeNull();
    expect(beacons()).toHaveLength(1);

    await productHints.close();
    expect(beaconFor("intro")).not.toBeNull();
    expect(beacons()).toHaveLength(2);
  });

  it("keeps the beacon visible when the overlay is disabled", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    await productHints.open("intro");

    expect(beaconFor("intro")).not.toBeNull();
  });

  it("anchors the popover to the element instead of the beacon", async () => {
    const el = document.querySelector<HTMLElement>("#intro")!;
    el.getBoundingClientRect = () => rect({ top: 300, left: 400, right: 600, bottom: 340, width: 200, height: 40 });

    const productHints = createHints({ hints: SAMPLE_HINTS, overlay: true });
    await productHints.show();
    await productHints.open("intro");

    expect(productHints.state.popoverAnchor).toBe(el);
    // Tour-step alignment: the popover clears the 10px cutout ring.
    expect(productHints.state.popover?.padding).toBe(10);
  });
});

describe("beacon visibility", () => {
  it("hides the beacon when its element leaves the viewport", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    const element = document.querySelector("#intro")!;

    await intersect(element, false);
    expect(beaconFor("intro").classList.contains("driver-hint-hidden")).toBe(true);

    await intersect(element, true);
    expect(beaconFor("intro").classList.contains("driver-hint-hidden")).toBe(false);
  });

  it("closes an open hint when its element leaves the viewport", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.open("intro");
    expect(popoverEl()).not.toBeNull();

    await intersect(document.querySelector("#intro")!, false);

    expect(popoverEl()).toBeNull();
    expect(productHints.getActive()).toBeUndefined();
  });
});

describe("opening and closing", () => {
  it("opens the popover when the beacon is clicked", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();

    await click(beaconFor("intro"));

    expect(popoverTitle()).toBe("Intro hint");
    expect(beaconFor("intro").getAttribute("aria-expanded")).toBe("true");
  });

  it("toggles closed when the same beacon is clicked again", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();

    await click(beaconFor("intro"));
    await click(beaconFor("intro"));

    expect(popoverEl()).toBeNull();
    expect(beaconFor("intro").getAttribute("aria-expanded")).toBe("false");
  });

  it("swaps the popover when another beacon is clicked", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();

    await click(beaconFor("intro"));
    await click(beaconFor("card"));

    expect(document.querySelectorAll(".driver-popover")).toHaveLength(1);
    expect(popoverTitle()).toBe("Card hint");
    expect(beaconFor("intro").getAttribute("aria-expanded")).toBe("false");
    expect(beaconFor("card").getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the beacons interactive with no overlay behind them", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    expect(document.querySelector(".driver-overlay")).toBeNull();
    expect(document.body.classList.contains("driver-active")).toBe(false);
  });

  it("closes on an outside click", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    await click(document.querySelector<HTMLElement>(".page-header"));

    expect(popoverEl()).toBeNull();
  });

  it("stays open when the popover itself is clicked", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    await click(document.querySelector<HTMLElement>(".driver-popover-description"));

    expect(popoverEl()).not.toBeNull();
  });

  it("closes on Escape and returns focus to the beacon", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    const focus = vi.spyOn(beaconFor("intro"), "focus");
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
    await flush();

    expect(popoverEl()).toBeNull();
    expect(focus).toHaveBeenCalled();
  });

  it("opens and closes programmatically", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    await productHints.open("card");
    expect(popoverTitle()).toBe("Card hint");
    expect(productHints.getActive()?.id).toBe("card");

    await productHints.close();
    expect(popoverEl()).toBeNull();
    expect(productHints.getActive()).toBeUndefined();
  });

  it("addresses a hint without an id by its index", async () => {
    const productHints = createHints({ hints: [{ element: "#intro", popover: { title: "First" } }] });
    await productHints.show();

    await productHints.open(0);

    expect(popoverTitle()).toBe("First");
  });

  it("ignores an unknown id", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    await expect(productHints.open("nope")).resolves.toBeUndefined();
    expect(popoverEl()).toBeNull();
  });

  it("renders a custom popover body through the popover slot", async () => {
    const productHints = createHints(
      { hints: SAMPLE_HINTS },
      { popover: (scope: { hint: DriverHint; dismiss: () => void }) => h("b", { class: "my-hint", onClick: scope.dismiss }, scope.hint.popover?.title) }
    );
    await productHints.show();
    await productHints.open("intro");

    expect(document.querySelector(".driver-popover .my-hint")?.textContent).toBe("Intro hint");
    expect(dismissButton()).toBeNull();

    await click(document.querySelector(".my-hint"));
    expect(beacons()).toHaveLength(1);
  });
});

describe("dismissing", () => {
  it("shows a Got it button by default", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    expect(dismissButton()?.innerHTML).toBe("Got it");
  });

  it("uses custom button text from the hint over the global default", async () => {
    await createHints({
      buttonText: "Global OK",
      hints: [{ element: "#intro", popover: { title: "One", buttonText: "Hint OK" } }, { element: "#card-1" }],
    }).show();

    await click(beacons()[0]);
    expect(dismissButton()?.innerHTML).toBe("Hint OK");

    await click(beacons()[1]);
    expect(dismissButton()?.innerHTML).toBe("Global OK");
  });

  it("hides the dismiss button when showButton is false", async () => {
    await createHints({ hints: [{ element: "#intro", popover: { title: "One", showButton: false } }] }).show();
    await click(beacons()[0]);

    expect(popoverEl()).not.toBeNull();
    expect(document.querySelector(".driver-popover-footer")).toBeNull();
  });

  it("renders no navigation or close buttons", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    expect(document.querySelector(".driver-popover-prev-btn")).toBeNull();
    expect(document.querySelector(".driver-popover-close-btn")).toBeNull();
    expect(document.querySelector(".driver-popover-progress-text")).toBeNull();
  });

  it("removes the beacon and popover when dismissed", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));

    await click(dismissButton());

    expect(popoverEl()).toBeNull();
    expect(beacons()).toHaveLength(1);
  });

  it("keeps the beacon when the popover is merely closed", async () => {
    await createHints({ hints: SAMPLE_HINTS }).show();
    await click(beaconFor("intro"));
    await click(document.querySelector<HTMLElement>(".page-header"));

    expect(beacons()).toHaveLength(2);
  });

  it("does not resurrect a dismissed hint on hide/show", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.dismiss("intro");

    await productHints.hide();
    await productHints.show();

    expect(beacons()).toHaveLength(1);
    expect(beacons()[0].getAttribute("aria-label")).toBe("Card hint");
  });

  it("brings a dismissed hint back with restore()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.dismiss("intro");
    expect(beacons()).toHaveLength(1);

    await productHints.restore("intro");

    expect(beacons()).toHaveLength(2);
  });

  it("brings every dismissed hint back with restoreAll()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.dismiss("intro");
    await productHints.dismiss("card");
    expect(beacons()).toHaveLength(0);

    await productHints.restoreAll();

    expect(beacons()).toHaveLength(2);
  });

  it("clears dismissals for the next show() when hidden", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.dismiss("intro");
    await productHints.hide();

    await productHints.restoreAll();
    await productHints.show();

    expect(beacons()).toHaveLength(2);
  });

  it("ignores restore() for a hint that was never dismissed", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    await productHints.restore("intro");

    expect(beacons()).toHaveLength(2);
  });

  it("resets dismissals on setHints()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.dismiss("intro");

    await productHints.setHints(SAMPLE_HINTS);

    expect(beacons()).toHaveLength(2);
  });
});

describe("hooks", () => {
  it("fires onOpen with the element, hint and instance", async () => {
    const onOpen = vi.fn();
    const instance = createHintsCore({ hints: SAMPLE_HINTS, onOpen });
    mountHints(instance);
    const productHints = wrapHints(instance);
    await productHints.show();

    await click(beaconFor("intro"));

    expect(onOpen).toHaveBeenCalledTimes(1);
    const [element, hint, opts] = onOpen.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(hint.id).toBe("intro");
    expect(opts.hints).toBe(instance);
    expect(opts.config.hints).toBe(SAMPLE_HINTS);
  });

  it("prefers a hint-level onOpen over the global one", async () => {
    const globalOpen = vi.fn();
    const hintOpen = vi.fn();
    await createHints({ hints: [{ element: "#intro", onOpen: hintOpen }], onOpen: globalOpen }).show();

    await click(beacons()[0]);

    expect(hintOpen).toHaveBeenCalledTimes(1);
    expect(globalOpen).not.toHaveBeenCalled();
  });

  it("fires onOpen for a programmatic open", async () => {
    const onOpen = vi.fn();
    const productHints = createHints({ hints: SAMPLE_HINTS, onOpen });
    await productHints.show();

    await productHints.open("intro");

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("fires onDismiss with a stable id for persistence", async () => {
    const onDismiss = vi.fn();
    await createHints({ hints: SAMPLE_HINTS, onDismiss }).show();

    await click(beaconFor("intro"));
    await click(dismissButton());

    expect(onDismiss).toHaveBeenCalledTimes(1);
    const [element, hint] = onDismiss.mock.calls[0];
    expect(element).toBe(document.querySelector("#intro"));
    expect(hint.id).toBe("intro");
  });

  it("runs onButtonClick instead of dismissing when provided", async () => {
    const onButtonClick = vi.fn();
    const onDismiss = vi.fn();
    await createHints({
      onDismiss,
      hints: [{ element: "#intro", id: "intro", popover: { title: "One", onButtonClick } }, SAMPLE_HINTS[1]],
    }).show();

    await click(beacons()[0]);
    await click(dismissButton());

    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
    // The hint is neither dismissed nor closed; the hook owns the behavior.
    expect(beacons()).toHaveLength(2);
    expect(popoverEl()).not.toBeNull();
  });

  it("falls back to the instance-level onButtonClick", async () => {
    const onButtonClick = vi.fn();
    const productHints = createHints({ hints: SAMPLE_HINTS, onButtonClick });
    await productHints.show();

    await click(beaconFor("intro"));
    await click(dismissButton());

    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(beacons()).toHaveLength(2);
  });

  it("lets onButtonClick dismiss through the instance", async () => {
    const productHints = createHints({
      hints: SAMPLE_HINTS,
      onButtonClick: (_element, hint, opts) => opts.hints.dismiss(hint.id!),
    });
    await productHints.show();

    await click(beaconFor("intro"));
    await click(dismissButton());

    expect(beacons()).toHaveLength(1);
    expect(popoverEl()).toBeNull();
  });

  it("fires onDismiss for a programmatic dismiss", async () => {
    const onDismiss = vi.fn();
    const productHints = createHints({ hints: SAMPLE_HINTS, onDismiss });
    await productHints.show();

    await productHints.dismiss("card");

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not fire onDismiss when the popover is only closed", async () => {
    const onDismiss = vi.fn();
    await createHints({ hints: SAMPLE_HINTS, onDismiss }).show();

    await click(beaconFor("intro"));
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape" }));
    await flush();

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("passes the hint data through to the hooks", async () => {
    const onOpen = vi.fn();
    await createHints({ hints: [{ element: "#intro", data: { tracking: "hint-1" } }], onOpen }).show();

    await click(beacons()[0]);

    expect(onOpen.mock.calls[0][1].data).toEqual({ tracking: "hint-1" });
  });

  it("lets onPopoverRender mutate the hint popover", async () => {
    await createHints({
      hints: [
        {
          element: "#intro",
          popover: {
            title: "One",
            onPopoverRender: popover => {
              const extra = document.createElement("button");
              extra.classList.add("hint-extra-btn");
              popover.footerButtons!.appendChild(extra);
            },
          },
        },
      ],
    }).show();

    await click(beacons()[0]);

    expect(document.querySelector(".driver-popover .hint-extra-btn")).not.toBeNull();
  });
});

describe("teardown", () => {
  it("removes every beacon and the popover on hide()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await click(beaconFor("intro"));

    await productHints.hide();

    expect(beacons()).toHaveLength(0);
    expect(popoverEl()).toBeNull();
    expect(productHints.isVisible()).toBe(false);
  });

  it("detaches every listener on hide()", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const docAddSpy = vi.spyOn(document, "addEventListener");
    const docRemoveSpy = vi.spyOn(document, "removeEventListener");

    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.hide();

    // Every listener the module attaches is detached again, with the same
    // function reference and capture flag. A capture mismatch is the classic
    // way a listener silently outlives its teardown.
    const normalize = (calls: [string, unknown, unknown?][]) =>
      calls.map(([type, listener, options]) => ({
        type,
        listener,
        capture: options === true || (typeof options === "object" && (options as AddEventListenerOptions)?.capture),
      }));

    const attached = normalize(addSpy.mock.calls.concat(docAddSpy.mock.calls) as [string, unknown, unknown?][]);
    const detached = normalize(removeSpy.mock.calls.concat(docRemoveSpy.mock.calls) as [string, unknown, unknown?][]);

    expect(attached).toHaveLength(4);
    attached.forEach(entry => {
      expect(detached).toContainEqual(entry);
    });
  });

  it("disconnects the intersection observers on hide()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.hide();

    expect(observerCallbacks.every(entry => entry.disconnected)).toBe(true);
  });

  it("stops repositioning after hide()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.hide();

    window.dispatchEvent(new Event("scroll"));
    await nextFrame();

    expect(beacons()).toHaveLength(0);
  });

  it("can be shown again after hide()", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await productHints.hide();
    await productHints.show();

    expect(beacons()).toHaveLength(2);
  });

  it("tolerates hide() before show()", () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });

    expect(() => productHints.hide()).not.toThrow();
  });
});

describe("tour interplay", () => {
  it("closes an open hint when a tour starts", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();
    await click(beaconFor("intro"));
    expect(popoverEl()).not.toBeNull();

    const d = createDriver({ animate: false, steps: [{ element: "#card-1", popover: { title: "Tour step" } }] });
    await d.drive();
    // The body-class observer settles on a microtask.
    await nextFrame();

    expect(productHints.getActive()).toBeUndefined();
    expect(popoverTitle()).toBe("Tour step");
  });

  it("leaves the beacons mounted for CSS to hide during a tour", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    const d = createDriver({ animate: false, steps: [{ element: "#card-1", popover: { title: "Tour step" } }] });
    await d.drive();
    await nextFrame();

    // The beacons stay in the DOM and come back on their own when the tour
    // ends, because `.driver-active .driver-hint` hides them meanwhile.
    expect(beacons()).toHaveLength(2);
    expect(document.body.classList.contains("driver-active")).toBe(true);

    await d.destroy();
    await nextFrame();

    expect(beacons()).toHaveLength(2);
    expect(document.body.classList.contains("driver-active")).toBe(false);
  });

  it("keeps hint state independent of the tour", async () => {
    const productHints = createHints({ hints: SAMPLE_HINTS });
    await productHints.show();

    const d = createDriver({ animate: false, steps: [{ element: "#card-1", popover: { title: "Tour step" } }] });
    await d.drive();
    await d.destroy();
    await nextFrame();

    await productHints.open("intro");

    expect(popoverTitle()).toBe("Intro hint");
  });
});

describe("multiple instances", () => {
  it("keeps two hint instances isolated", async () => {
    const first = hintsFactory({ hints: [{ element: "#intro", id: "a", popover: { title: "First" } }] });
    const second = hintsFactory({ hints: [{ element: "#card-1", id: "b", popover: { title: "Second" } }] });
    mountHints(first);
    mountHints(second);

    first.show();
    second.show();
    first.open("a");
    await flush();

    expect(beacons()).toHaveLength(2);
    expect(popoverTitle()).toBe("First");
    expect(second.getActive()).toBeUndefined();
  });
});
