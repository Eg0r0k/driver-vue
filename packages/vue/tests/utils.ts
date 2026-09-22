import { createApp, h, nextTick, type App } from "vue";
import { createDriver as createDriverCore } from "../src/core/driver";
import DriverTour from "../src/components/DriverTour.vue";
import type { Config, Driver, DriveStep } from "../src/types";

// A small, stable DOM that the tests highlight against.
export const DEMO_HTML = `
  <header class="page-header"><h1>Title</h1></header>
  <p id="intro">Intro paragraph</p>
  <button id="card-1" type="button">Card One</button>
  <ul class="feature-list"><li>One</li></ul>
`;

export const SAMPLE_STEPS: DriveStep[] = [
  { element: "#intro", popover: { title: "Step 1", description: "First" } },
  { element: "#card-1", popover: { title: "Step 2", description: "Second" } },
  { element: ".feature-list", popover: { title: "Step 3", description: "Third" } },
];

/** Lets Vue render and Floating UI position (computePosition is async). */
export async function flush(): Promise<void> {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
}

// The driver.js API is synchronous, but the DOM is rendered by Vue on the
// next tick. The test driver wraps every method that changes what is rendered
// so `await d.drive()` reads the same as the upstream tests.
type AsyncMethods = "drive" | "highlight" | "moveNext" | "movePrevious" | "moveTo" | "destroy" | "refresh" | "setSteps";
export type TestDriver = Omit<Driver, AsyncMethods> & {
  [K in AsyncMethods]: (...args: Parameters<Driver[K]>) => Promise<void>;
};

let active: Driver | undefined;
let app: App | undefined;
let host: HTMLElement | undefined;

export function mountTour(driver: Driver, slots?: Record<string, any>): App {
  host = document.createElement("div");
  host.id = "driver-test-host";
  document.body.appendChild(host);

  app = createApp({ render: () => h(DriverTour, { driver }, slots) });
  app.config.warnHandler = () => {};
  app.mount(host);

  return app;
}

export function createDriver(config?: Config, slots?: Record<string, any>): TestDriver {
  const driver = createDriverCore(config);
  active = driver;
  mountTour(driver, slots);

  const wrap =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    async (...args: A) => {
      fn(...args);
      await flush();
    };

  return {
    ...driver,
    drive: wrap(driver.drive),
    highlight: wrap(driver.highlight),
    moveNext: wrap(driver.moveNext),
    movePrevious: wrap(driver.movePrevious),
    moveTo: wrap(driver.moveTo),
    destroy: wrap(driver.destroy),
    refresh: wrap(driver.refresh),
    setSteps: wrap(driver.setSteps),
  };
}

// Resets the DOM before each test and tears the driver down after, so state
// never leaks between tests. Call once per file.
export function useDriverHarness(): void {
  beforeEach(() => {
    document.body.innerHTML = DEMO_HTML;
  });

  afterEach(async () => {
    active?.destroy();
    active = undefined;
    await nextTick();
    app?.unmount();
    app = undefined;
    host?.remove();
    host = undefined;
    document.body.innerHTML = "";
    document.body.className = "";
  });
}

// Waits a single animation frame — needed for hooks that fire in the rAF loop.
export async function nextFrame(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await flush();
}

export const popoverEl = () => document.querySelector<HTMLElement>(".driver-popover");
export const popoverTitle = () => document.querySelector(".driver-popover-title")?.textContent?.trim();
export const popoverDescription = () => document.querySelector(".driver-popover-description")?.textContent?.trim();
export const progressText = () => document.querySelector(".driver-popover-progress-text")?.textContent?.trim();
export const navButton = (which: "next" | "prev" | "close") =>
  document.querySelector<HTMLButtonElement>(`.driver-popover-${which}-btn`);
export const overlayEl = () => document.querySelector<SVGSVGElement>(".driver-overlay");
export const stageEl = () => document.querySelector<HTMLElement>(".driver-stage");

/** Clicks an element and lets Vue render. */
export async function click(element: Element | null | undefined): Promise<void> {
  element?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  await flush();
}

export async function pressKey(key: string): Promise<void> {
  window.dispatchEvent(new KeyboardEvent("keyup", { key }));
  await flush();
}
