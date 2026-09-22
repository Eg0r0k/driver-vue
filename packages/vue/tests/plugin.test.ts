import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createDriverPlugin, DriverPlugin, injectDriver, provideDriver } from "../src/plugin";
import { createDriver } from "../src/core/driver";
import DriverTour from "../src/components/DriverTour.vue";
import DriverHints from "../src/components/DriverHints.vue";
import { createHints } from "../src/core/hints";
import { DEMO_HTML, flush, popoverTitle, SAMPLE_STEPS } from "./utils";

beforeEach(() => {
  document.body.innerHTML = DEMO_HTML;
});

afterEach(() => {
  document.body.innerHTML = "";
  document.body.className = "";
});

describe("DriverPlugin", () => {
  it("registers the components globally on request", () => {
    const App = defineComponent({ template: "<div><DriverTour /><DriverStage :stage=\"{x:0,y:0,width:1,height:1}\" /></div>" });
    const wrapper = mount(App, { global: { plugins: [[DriverPlugin, { components: true }]] } });

    expect(wrapper.findComponent(DriverTour).exists()).toBe(true);
    expect(wrapper.find(".driver-stage").exists()).toBe(true);
  });

  it("uses a custom component prefix", () => {
    const App = defineComponent({ template: "<div><TourStage :stage=\"{x:0,y:0,width:1,height:1}\" /></div>" });
    const wrapper = mount(App, { global: { plugins: [[DriverPlugin, { components: "Tour" }]] } });

    expect(wrapper.find(".driver-stage").exists()).toBe(true);
  });

  it("does not register components by default", () => {
    const warn = vi.fn();
    const App = defineComponent({ template: "<div><DriverStage /></div>" });
    mount(App, { global: { plugins: [DriverPlugin], config: { warnHandler: warn } } });

    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0][0])).toContain("Failed to resolve component");
  });

  it("renders the shared driver through <DriverTour> without a prop", async () => {
    let shared: ReturnType<typeof injectDriver> | undefined;
    const App = defineComponent({
      setup() {
        shared = injectDriver();
        return () => h(DriverTour);
      },
    });
    mount(App, {
      attachTo: document.body,
      global: { plugins: [[createDriverPlugin({ defaults: { animate: false } })]] },
    });

    shared!.value.setConfig({ animate: false, steps: SAMPLE_STEPS });
    shared!.value.drive();
    await flush();

    expect(popoverTitle()).toBe("Step 1");
    shared!.value.destroy();
  });

  it("merges install-time options over factory options", () => {
    const plugin = createDriverPlugin({ defaults: { animate: false, stagePadding: 1 } });
    let config: any;
    const App = defineComponent({
      setup() {
        config = injectDriver().value.getConfig();
        return () => h("div");
      },
    });
    mount(App, { global: { plugins: [[plugin, { defaults: { stagePadding: 9 } }]] } });

    expect(config.animate).toBe(false);
    expect(config.stagePadding).toBe(9);
  });

  it("provides a driver to a subtree with provideDriver", async () => {
    const driver = createDriver({ animate: false, steps: SAMPLE_STEPS });
    const Child = defineComponent({ setup: () => () => h(DriverTour) });
    const App = defineComponent({
      setup() {
        provideDriver(driver);
        return () => h(Child);
      },
    });
    mount(App, { attachTo: document.body });

    driver.drive();
    await flush();
    expect(popoverTitle()).toBe("Step 1");
    driver.destroy();
  });

  it("injectDriver throws without a provider unless optional", () => {
    const App = defineComponent({
      setup() {
        expect(() => injectDriver()).toThrow(/No driver provided/);
        expect(injectDriver({ optional: true })).toBeUndefined();
        return () => h("div");
      },
    });
    mount(App, { global: { config: { warnHandler: () => {} } } });
  });

  it("<DriverTour> without any driver renders nothing and warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(DriverTour, { attachTo: document.body });
    await nextTick();

    expect(wrapper.html()).not.toContain("driver-");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("has no driver"));
    warn.mockRestore();
  });
});

describe("server-side rendering", () => {
  it("renders <DriverTour> to an empty fragment on the server", async () => {
    const driver = createDriver({ steps: SAMPLE_STEPS });
    const app = createSSRApp({ render: () => h("div", { id: "app" }, [h(DriverTour, { driver })]) });

    const html = await renderToString(app);

    expect(html).toContain('<div id="app">');
    expect(html).not.toContain("driver-popover");
    expect(html).not.toContain("driver-overlay");
  });

  it("renders <DriverHints> to an empty fragment on the server", async () => {
    const hints = createHints({ hints: [{ element: "#intro" }] });
    const app = createSSRApp({ render: () => h("div", [h(DriverHints, { hints })]) });

    const html = await renderToString(app);

    expect(html).not.toContain("driver-hint");
  });

  it("creates an inert driver without a window", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    try {
      // The module-level isBrowser flag is captured at import; re-import fresh.
      vi.resetModules();
      const { createDriver: createInert } = await import("../src/core/driver");
      const d = createInert({ steps: SAMPLE_STEPS });
      expect(() => d.drive()).not.toThrow();
      expect(() => d.highlight({ element: "#intro" })).not.toThrow();
      expect(() => d.refresh()).not.toThrow();
      expect(() => d.destroy()).not.toThrow();
      expect(d.isActive()).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
