import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

describe("test environment", () => {
  it("mounts a Vue component into happy-dom", () => {
    const Hello = defineComponent({ render: () => h("div", { class: "hello" }, "hi") });
    const wrapper = mount(Hello);

    expect(wrapper.find(".hello").text()).toBe("hi");
  });
});
