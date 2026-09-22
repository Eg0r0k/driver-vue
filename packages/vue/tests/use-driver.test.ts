import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { useDriver, type UseDriverReturn } from "../src/composables/useDriver";
import { createDriverPlugin } from "../src/plugin";
import DriverTour from "../src/components/DriverTour.vue";
import { DEMO_HTML, flush, popoverTitle, SAMPLE_STEPS } from "./utils";
import type { Config } from "../src/types";

beforeEach(() => {
  document.body.innerHTML = DEMO_HTML;
});

afterEach(() => {
  document.body.innerHTML = "";
  document.body.className = "";
});

function host(setup: () => UseDriverReturn, plugins: any[] = []) {
  let api!: UseDriverReturn;
  const Host = defineComponent({
    setup() {
      api = setup();
      return () => h("div", [h(DriverTour, { driver: api.driver })]);
    },
  });
  const wrapper = mount(Host, { attachTo: document.body, global: { plugins } });
  return { wrapper, api };
}

describe("useDriver", () => {
  it("creates a driver and mirrors its state as refs", async () => {
    const { api } = host(() => useDriver({ animate: false, steps: SAMPLE_STEPS }));

    expect(api.isActive.value).toBe(false);
    expect(api.activeIndex.value).toBeUndefined();

    api.drive(1);
    await flush();

    expect(api.isActive.value).toBe(true);
    expect(api.activeIndex.value).toBe(1);
    expect(api.activeStep.value?.popover?.title).toBe("Step 2");
    expect(api.activeElement.value).toBe(document.querySelector("#card-1"));
    expect(api.isFirstStep.value).toBe(false);
    expect(api.isLastStep.value).toBe(false);
    expect(api.hasNextStep.value).toBe(true);
    expect(api.hasPreviousStep.value).toBe(true);
    expect(api.popover.value?.title).toBe("Step 2");
    expect(api.stage.value).toBeDefined();
    expect(popoverTitle()).toBe("Step 2");

    api.moveTo(2);
    await flush();
    expect(api.isLastStep.value).toBe(true);
    expect(api.hasNextStep.value).toBe(false);
  });

  it("hides the dummy element behind activeElement", async () => {
    const { api } = host(() => useDriver({ animate: false, steps: [{ popover: { title: "Modal" } }] }));
    api.drive();
    await flush();

    expect(api.activeElement.value).toBeUndefined();
    expect(api.driver.getActiveElement()?.id).toBe("driver-dummy-element");
  });

  it("destroys the tour when the component unmounts", async () => {
    const { wrapper, api } = host(() => useDriver({ animate: false, steps: SAMPLE_STEPS }));
    api.drive();
    await flush();
    expect(document.body.classList.contains("driver-active")).toBe(true);

    wrapper.unmount();
    await nextTick();

    expect(api.isActive.value).toBe(false);
    expect(document.body.classList.contains("driver-active")).toBe(false);
    expect(document.querySelector(".driver-popover")).toBeNull();
  });

  it("re-applies a reactive config when it changes", async () => {
    const config = ref<Config>({ animate: false, steps: SAMPLE_STEPS, nextBtnText: "Go" });
    const { api } = host(() => useDriver(config));

    expect(api.driver.getConfig("nextBtnText")).toBe("Go");

    config.value = { ...config.value, nextBtnText: "Onward" };
    await nextTick();

    expect(api.driver.getConfig("nextBtnText")).toBe("Onward");
    expect(api.driver.getConfig("animate")).toBe(false);
  });

  it("accepts a getter config", async () => {
    const text = ref("A");
    const { api } = host(() => useDriver(() => ({ animate: false, steps: SAMPLE_STEPS, nextBtnText: text.value })));

    text.value = "B";
    await nextTick();

    expect(api.driver.getConfig("nextBtnText")).toBe("B");
  });

  it("merges the plugin defaults under the config", () => {
    const plugin = createDriverPlugin({ defaults: { animate: false, stagePadding: 3, nextBtnText: "Default" } });
    const { api } = host(() => useDriver({ nextBtnText: "Own" }), [plugin]);

    expect(api.driver.getConfig("animate")).toBe(false);
    expect(api.driver.getConfig("stagePadding")).toBe(3);
    expect(api.driver.getConfig("nextBtnText")).toBe("Own");
  });

  it("reuses the shared plugin driver with { shared: true } and keeps it alive on unmount", async () => {
    const plugin = createDriverPlugin({ defaults: { animate: false } });
    const { wrapper, api } = host(() => useDriver({ steps: SAMPLE_STEPS }, { shared: true }), [plugin]);
    const { api: other } = host(() => useDriver({}, { shared: true }), [plugin]);

    // Two apps, two plugin installs, two shared drivers; within one app it is the same instance.
    expect(api.driver).not.toBe(other.driver);
    expect(api.driver.getConfig("steps")).toBe(SAMPLE_STEPS);

    api.drive();
    await flush();
    wrapper.unmount();
    await nextTick();

    expect(api.driver.isActive()).toBe(true);
    api.driver.destroy();
  });
});
